require('dotenv').config();


const { GoogleGenerativeAI } = require('@google/generative-ai');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);



const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./models/tasks');

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint to list available Gemini models
app.get('/api/gemini/models', async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Gemini ListModels Error:', error);
    res.status(500).json({ error: error.message || 'Failed to list Gemini models' });
  }
});

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Routes ---

// Default tasks template (with order field for drag-drop)
const DEFAULT_TASKS = [
  { title: "Master React Hooks", isDone: false, description: "Learn useState, useEffect, useContext and custom hooks.", order: 0 },
  { title: "Build Express Server", isDone: false, description: "Set up backend with Node.js and Express.", order: 1 },
  { title: "Database Schema Design", isDone: false, description: "Design MongoDB collections and relationships.", order: 2 }
];



// Example endpoint to interact with Gemini
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Gemini API error' });
  }
});

// 1. GET ALL TASKS for a device (sorted by order) - Seeds default tasks for new devices
app.get('/api/tasks', async (req, res) => {
  try {
    const { deviceId } = req.query;
    if (!deviceId) {
      return res.status(400).json({ message: 'deviceId is required' });
    }
    
    // First, claim any orphaned tasks (tasks without deviceId) for this device
    await Task.updateMany(
      { $or: [{ deviceId: { $exists: false } }, { deviceId: null }, { deviceId: '' }] },
      { $set: { deviceId, order: 0 } }
    );
    
    let tasks = await Task.find({ deviceId }).sort({ order: 1 });
    
    // If this device has no tasks, seed with defaults
    if (tasks.length === 0) {
      const tasksToCreate = DEFAULT_TASKS.map(task => ({
        ...task,
        deviceId
      }));
      tasks = await Task.insertMany(tasksToCreate);
    }
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET SINGLE TASK
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { deviceId } = req.query;
    let task = null;
    
    // Try finding with deviceId first
    if (deviceId) {
      task = await Task.findOne({ _id: req.params.id, deviceId });
      
      // Fallback: find orphaned task and claim it
      if (!task) {
        task = await Task.findOneAndUpdate(
          { 
            _id: req.params.id, 
            $or: [
              { deviceId: { $exists: false } }, 
              { deviceId: null }, 
              { deviceId: '' }
            ] 
          },
          { $set: { deviceId } },
          { new: true }
        );
      }
    }
    
    // Last resort: find by ID only (backwards compatibility)
    if (!task && !deviceId) {
      task = await Task.findById(req.params.id);
    }
    
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: "Task not found or access denied" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. CREATE TASK
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, isDone, deviceId } = req.body;
    if (!deviceId) {
      return res.status(400).json({ message: 'deviceId is required' });
    }
    
    // Get the highest order for this device
    const lastTask = await Task.findOne({ deviceId }).sort({ order: -1 });
    const newOrder = lastTask ? lastTask.order + 1 : 0;
    
    const task = new Task({
      title,
      description: description || "",
      isDone: isDone || false,
      order: newOrder,
      deviceId
    });
    
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. REORDER TASKS (must come before :id route)
app.put('/api/tasks/reorder', async (req, res) => {
  try {
    const { taskIds, deviceId } = req.body;
    if (!deviceId) {
      return res.status(400).json({ message: 'deviceId is required' });
    }
    
    // Update each task with its new order (only if device owns it)
    const updatePromises = taskIds.map((id, index) => 
      Task.findOneAndUpdate(
        { _id: id, deviceId },
        { order: index },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    // Return tasks in new order for this device
    const tasks = await Task.find({ deviceId }).sort({ order: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. UPDATE TASK
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) {
      return res.status(400).json({ message: 'deviceId is required' });
    }
    
    // First try to find by id and deviceId
    let task = await Task.findOneAndUpdate(
      { _id: req.params.id, deviceId },
      req.body,
      { new: true }
    );
    
    // If not found, try finding by id only (legacy tasks without deviceId)
    // and update it with the deviceId
    if (!task) {
      task = await Task.findOneAndUpdate(
        { _id: req.params.id, deviceId: { $exists: false } },
        { ...req.body, deviceId },
        { new: true }
      );
    }
    
    // Also handle tasks that have deviceId: null or empty
    if (!task) {
      task = await Task.findOneAndUpdate(
        { _id: req.params.id, $or: [{ deviceId: null }, { deviceId: '' }] },
        { ...req.body, deviceId },
        { new: true }
      );
    }
    
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: "Task not found or access denied" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 6. DELETE TASK
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { deviceId } = req.query;
    
    // Try with deviceId first
    let task = await Task.findOneAndDelete({ _id: req.params.id, deviceId });
    
    // If not found, try legacy tasks without deviceId
    if (!task) {
      task = await Task.findOneAndDelete({ 
        _id: req.params.id, 
        $or: [{ deviceId: { $exists: false } }, { deviceId: null }, { deviceId: '' }] 
      });
    }
    
    if (!task) {
      return res.status(404).json({ message: "Task not found or access denied" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. RESET - Only for this device
app.post('/api/reset', async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) {
      return res.status(400).json({ message: 'deviceId is required' });
    }
    
    // Delete only this device's tasks
    await Task.deleteMany({ deviceId });
    
    // Create default tasks for this device (reuse DEFAULT_TASKS template)
    const tasksToCreate = DEFAULT_TASKS.map(task => ({
      ...task,
      deviceId
    }));
    const tasks = await Task.insertMany(tasksToCreate);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. AI SUGGESTIONS - Get learning resources for a task
app.post('/api/suggestions', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const prompt = `You are a helpful learning assistant. Based on this task:
Title: "${title}"
Description: "${description || 'No description provided'}"

Provide learning resources in this EXACT JSON format (no markdown, just raw JSON):
{
  "summary": "A brief 2-3 sentence explanation of what this topic is about",
  "youtubeSearchTerms": ["search term 1", "search term 2"],
  "resources": [
    {"type": "documentation", "name": "Resource Name", "url": "https://...", "description": "Why this helps"},
    {"type": "tutorial", "name": "Resource Name", "url": "https://...", "description": "Why this helps"},
    {"type": "article", "name": "Resource Name", "url": "https://...", "description": "Why this helps"}
  ],
  "tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3"],
  "estimatedTime": "Estimated time to learn this (e.g., '2-3 hours', '1 week')"
}

Only respond with valid JSON. Include real, working URLs to official documentation, popular tutorials, and helpful articles.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    let result, response, textResponse;
    try {
      result = await model.generateContent(prompt);
      response = await result.response;
      textResponse = response.text();
    } catch (apiErr) {
      console.error('Gemini API call failed:', apiErr);
      return res.status(500).json({ message: 'Gemini API call failed', error: apiErr?.message, stack: apiErr?.stack });
    }

    // Try to parse as JSON (Gemini sometimes wraps in markdown code blocks)
    let suggestions;
    try {
      // Remove markdown code blocks if present
      const cleanJson = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      suggestions = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', textResponse, parseErr);
      return res.status(500).json({ 
        message: 'Failed to parse AI response',
        raw: textResponse,
        parseError: parseErr?.message,
        parseStack: parseErr?.stack
      });
    }

    res.json(suggestions);
  } catch (err) {
    console.error('Suggestions endpoint error:', err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));