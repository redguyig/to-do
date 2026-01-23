import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Details from './pages/Details';
import ThemeToggle from './components/ThemeToggle';
import './App.css';
import Layout from './components/Layout.jsx'
import { DEFAULT_TASKS } from './data/defaultTasks.js';

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('v2_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    localStorage.setItem('v2_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    document.body.classList.toggle('light-theme', !isDarkMode);
  }, [isDarkMode]);

  return (
    // <Router>
    //   <div className="app-wrapper">
    //     <ThemeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
        
    //     <Routes>
    //       {/* We pass tasks and the setTasks function as props to Home */}
    //       <Route path="/" element={<Home tasks={tasks} setTasks={setTasks} />} />
          
    //       {/* The :taskId is a dynamic parameter */}
    //       <Route path="/task/:taskId" element={<Details tasks={tasks} />} />
    //     </Routes>
    //   </div>
    // </Router>
    // import Layout from './components/Layout'; // <-- Add this if not already imported


  <Router>
    <Routes>
      {/* Parent Route: This provides the 'shell' */}
      <Route element=
      {<Layout 
      tasks={tasks}
      isDarkMode={isDarkMode} 
      onToggle={() => setIsDarkMode(!isDarkMode)} />}>
        
        {/* Child Routes: These fill the <Outlet /> */}
        <Route path="/" element={<Home tasks={tasks} setTasks={setTasks} />} />
        <Route path="/task/:taskId" element={<Details tasks={tasks} />} />
        
      </Route>
    </Routes>
  </Router>

  );
}

export default App;