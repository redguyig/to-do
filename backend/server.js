const express = require('express');
const cors = require('cors'); 
const app = express();

app.use(cors());
app.use(express.json());

// --- Simulated Database ---
const DEFAULT_TASKS = [
  { id: 1, title: "Master React Hooks", isDone: false, description: "Learn advanced hooks." },
  { id: 2, title: "Build Express Server", isDone: false, description: "Set up backend server." },
  { id: 3, title: "Database Schema Design", isDone: false, description: "Design DB schema." }
];

// Load defaults initially
let tasks = [...DEFAULT_TASKS];

// --- Routes ---

// 1. GET ALL TASKS
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// 2. GET SINGLE TASK (For Details.jsx)
app.get('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id); // Params are strings, so parse to Int
  const task = tasks.find(t => t.id === taskId);
  
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

// 3. CREATE TASK (For Home.jsx addTask)
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;
  
  const newTask = {
    id: Date.now(), // Generate a simple unique ID
    title,
    description: description || "",
    isDone: false
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// 4. UPDATE TASK (For Home.jsx handleIncrement/Mark Done)
app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex > -1) {
    // Merge existing task with updates from client
    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    res.json(tasks[taskIndex]);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

// 5. DELETE TASK
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== taskId);
  res.json({ message: "Task deleted successfully" });
});

// 6. RESET (Optional - to support the reset button in UI)
app.post('/api/reset', (req, res) => {
    // Reset tasks array to a fresh copy of defaults
    tasks = [...DEFAULT_TASKS]; 
    res.json(tasks);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));