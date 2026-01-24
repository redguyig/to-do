require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./models/tasks');

const app = express();

app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Routes ---

// Default tasks template
const DEFAULT_TASKS = [
  { title: "Master React Hooks", isDone: false, description: "Learn useState, useEffect, useContext and custom hooks.", order: 0 },
  { title: "Build Express Server", isDone: false, description: "Set up backend with Node.js and Express.", order: 1 },
  { title: "Database Schema Design", isDone: false, description: "Design MongoDB collections and relationships.", order: 2 }
];

// 1. GET ALL TASKS for a device (sorted by order) - Seeds default tasks for new devices
app.get('/api/tasks', async (req, res) => {
  try {
    const { deviceId } = req.query;
    if (!deviceId) {
      return res.status(400).json({ message: 'deviceId is required' });
    }
    
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
    const task = await Task.findById(req.params.id);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: "Task not found" });
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
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, deviceId },  // Ensure device owns this task
      req.body,
      { new: true }
    );
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
    const task = await Task.findOneAndDelete({ _id: req.params.id, deviceId });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));