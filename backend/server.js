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

// 1. GET ALL TASKS
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
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
  const task = new Task({
    title: req.body.title,
    description: req.body.description || ""
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. UPDATE TASK
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5. DELETE TASK
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. RESET
app.post('/api/reset', async (req, res) => {
  try {
    await Task.deleteMany({});
    const defaultTasks = [
      { title: "Master React Hooks", isDone: false, description: "Learn advanced hooks." },
      { title: "Build Express Server", isDone: false, description: "Set up backend server." },
      { title: "Database Schema Design", isDone: false, description: "Design DB schema." }
    ];
    const tasks = await Task.insertMany(defaultTasks);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));