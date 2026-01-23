// // import { useState } from 'react';
// // import TaskInput from '../components/TaskInput';
// // import ProgressBar from '../components/ProgressBar';
// // import TaskList from '../components/TaskList';
// // import { DEFAULT_TASKS } from '../data/defaultTasks.js';
// // function Home({ tasks, setTasks }) {
// //   const [searchQuery, setSearchQuery] = useState("");
// //   // At the top of Home.jsx

  
// //   const addTask = (title,description) => {
// //     setTasks([...tasks, { id: Date.now(), title, isDone: false, description }]);
// //   };

// //   const handleIncrement = () => {
// //     const next = tasks.find(t => !t.isDone);
// //     if (next) {
// //       setTasks(tasks.map(t => t.id === next.id ? { ...t, isDone: true } : t));
// //     }
// //   };
// //   const handleReset = () => {
// //   if (window.confirm("Are you sure you want to reset your roadmap?")) {
// //     setTasks(DEFAULT_TASKS); // Make sure DEFAULT_TASKS is defined/imported
// //     localStorage.setItem('v2_tasks', JSON.stringify(DEFAULT_TASKS)); // Update localStorage as well
// //   }
// // };  

// //   const deleteTask = (id) => {
// //     setTasks(tasks.filter(t => t.id !== id));
// //   };

// //   const filteredTasks = tasks.filter((task) => 
// //     task.title.toLowerCase().includes(searchQuery.toLowerCase())
// //   );

// //   return (
// //     <>
// //     <h1>Uni Roadmap v2</h1>
// //     <TaskInput onAddTask={addTask} />
// //     <input 
// //       className="search-bar"
// //       placeholder="Search milestones..." 
// //       value={searchQuery}
// //       onChange={(e) => setSearchQuery(e.target.value)}
// //     />
// //     <TaskList 
// //       tasks={filteredTasks} 
// //       onIncrement={handleIncrement} 
// //       onDelete={deleteTask} 
// //     />
// //     <button className="reset-btn" onClick={handleReset}>
// //       Reset list
// //     </button>
// //   </>
// //   );
  
// // }

// // export default Home;
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import TaskInput from '../components/TaskInput';
// import TaskList from '../components/TaskList';
// import { DEFAULT_TASKS } from '../data/defaultTasks.js';

// // Change this URL to match your backend server port
// const API_URL = "http://localhost:5000/api/tasks";

// function Home({ tasks, setTasks }) {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // 1. READ: Fetch tasks from API on mount
//   useEffect(() => {
//     const fetchTasks = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(API_URL);
//         setTasks(response.data);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching tasks:", err);
//         setError("Could not connect to server. Ensure your backend is running.");
//         // Optional: Fallback to defaults if server is down, for UI testing
//         // setTasks(DEFAULT_TASKS); 
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTasks();
//   }, [setTasks]);

//   // 2. CREATE: Add a new task
//   const addTask = async (title, description) => {
//     const newTaskData = { 
//       title, 
//       description: description || "No details provided.",
//       isDone: false 
//     };

//     try {
//       // Send to server
//       const response = await axios.post(API_URL, newTaskData);
//       // Update local state with the saved task (including the new DB id)
//       setTasks(prev => [...prev, response.data]);
//     } catch (err) {
//       console.error("Error adding task:", err);
//       alert("Failed to save task to server.");
//     }
//   };

//   // 3. UPDATE: specific logic to mark the next available task as done
//   const handleIncrement = async () => {
//     const nextTask = tasks.find(t => !t.isDone);
    
//     if (!nextTask) return; // All done or no tasks

//     try {
//       // Send update to server
//       const updatedData = { ...nextTask, isDone: true };
//       const response = await axios.put(`${API_URL}/${nextTask.id}`, updatedData);

//       // Update local state
//       setTasks(prev => 
//         prev.map(t => t.id === nextTask.id ? response.data : t)
//       );
//     } catch (err) {
//       console.error("Error updating task:", err);
//     }
//   };

//   // 4. DELETE: Remove a task
//   const deleteTask = async (id) => {
//     try {
//       await axios.delete(`${API_URL}/${id}`);
//       setTasks(prev => prev.filter(t => t.id !== id));
//     } catch (err) {
//       console.error("Error deleting task:", err);
//     }
//   };

//   // 5. BULK RESET: (Advanced) - Seeding the DB
//   const handleReset = async () => {
//     if (!window.confirm("This will overwrite the database with default tasks. Continue?")) return;

//     try {
//       setLoading(true);
      
//       // In a real app, you'd likely have a specific endpoint like POST /api/tasks/seed
//       // For now, we mimic it by manually resetting (Note: Check if your backend supports this)
      
//       // Option A: If you created a seed endpoint:
//       // const res = await axios.post(`${API_URL}/seed`, { tasks: DEFAULT_TASKS });
//       // setTasks(res.data);

//       // Option B: Client-side simulation (Simulate reset by erroring out for now)
//       console.warn("Reset requires a backend '/seed' endpoint to work correctly with Axios.");
//       alert("Reset feature requires backend configuration.");
      
//     } catch (err) {
//       console.error("Error resetting tasks:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredTasks = tasks.filter((task) => 
//     task.title.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (loading && tasks.length === 0) return <div style={{padding:'20px', textAlign:'center'}}>Loading tasks from server...</div>;
  
//   return (
//     <>
//       <h1>Uni Roadmap v2</h1>
      
//       {error && <div style={{color: 'red', textAlign: 'center', marginBottom:'10px'}}>{error}</div>}

//       <TaskInput onAddTask={addTask} />
      
//       <input 
//         className="search-bar"
//         placeholder="Search milestones..." 
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//       />
      
//       <TaskList 
//         tasks={filteredTasks} 
//         onIncrement={handleIncrement} 
//         onDelete={deleteTask} 
//       />

//       <button className="reset-btn" onClick={handleReset} style={{opacity: 0.7}}>
//         Reset list (Requires Server)
//       </button>
//     </>
//   );
// }

// export default Home;

import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import { DEFAULT_TASKS } from '../data/defaultTasks.js';

const API_URL = "http://localhost:5000/api/tasks";

function Home({ tasks, setTasks }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // NEW: State for our external quote
  const [quote, setQuote] = useState({ text: "Loading motivation...", author: "" });

  // 1. READ: Combined fetch for Tasks and Quotes
  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      // try {
      //   // --- FETCH INTERNAL ROADMAP ---
      //   const taskRes = await axios.get(API_URL);
      //   setTasks(taskRes.data);
      //   setError(null);

      //   // --- FETCH EXTERNAL QUOTE (ZenQuotes via Proxy) ---
      //   // We use AllOrigins proxy to avoid common CORS errors from public APIs
      //   const quoteRes = await axios.get('https://api.allorigins.win/raw?url=https://zenquotes.io/api/today');
      //   setQuote({
      //     text: quoteRes.data[0].q,
      //     author: quoteRes.data[0].a
      //   });

      // } catch (err) {
      //   console.error("API Error:", err);
      //   setError("Network Error: Make sure your backend server is running.");
      // } finally {
      //   setLoading(false);
      // }
       // 1. Critical: Fetch Tasks (Keep this in the main try/catch)
    try {
      const taskRes = await axios.get(API_URL);
      setTasks(taskRes.data);
      setError(null);
    } catch (err) {
      console.error("Backend Error:", err);
      setError("Network Error: Make sure your backend server is running.");
      setLoading(false);
      return; // Stop here if backend fails
    }

    // 2. Non-Critical: Fetch Quote (Wrap in its OWN try/catch)
    // try {
    //   const quoteRes = await axios.get('https://api.allorigins.win/raw?url=https://zenquotes.io/api/today');
    //   setQuote({
    //     text: quoteRes.data[0].q,
    //     author: quoteRes.data[0].a
    //   });
    // } catch (quoteErr) {
    //   // If quotes fail, just log it. Do NOT set the main error state.
    //   console.warn("Quote API failed, using default.", quoteErr);
    //   // Optional: Set a fallback quote here if you want
    // }
     try {
      // Changed to DummyJSON (No proxy needed, works reliably)
      const quoteRes = await axios.get('https://dummyjson.com/quotes/random');
      setQuote({
        text: quoteRes.data.quote,   // Note the change: .quote instead of .q
        author: quoteRes.data.author // Note the change: .author instead of .a
      });
    } catch (quoteErr) {
      // If quotes fail, just log it. Do NOT set the main error state.
      console.warn("Quote API failed, using default.", quoteErr); 
    } 
    finally {
      // Always turn off loading at the very end
      setLoading(false);
    }
    };

    fetchHomeData();
  }, [setTasks]);

  // 2. CREATE: (Optimized)
  const addTask = async (title, description) => {
    try {
      const response = await axios.post(API_URL, { 
        title, 
        description: description || "No details.", 
        isDone: false 
      });
      setTasks(prev => [...prev, response.data]);
    } catch (err) {
      alert("Error adding task. Backend might be down.");
    }
  };

  // 3. UPDATE: (Optimized)
  const handleIncrement = async () => {
    const nextTask = tasks.find(t => !t.isDone);
    if (!nextTask) return;

    try {
      const response = await axios.put(`${API_URL}/${nextTask.id}`, { ...nextTask, isDone: true });
      setTasks(prev => prev.map(t => t.id === nextTask.id ? response.data : t));
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // 4. DELETE:
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // 5. RESET: (Syncing with your server.js /api/reset)
  const handleReset = async () => {
    if (!window.confirm("Overwrite database with default tasks?")) return;
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/reset");
      setTasks(res.data);
    } catch (err) {
      alert("Reset failed. Check backend /api/reset route.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* QUOTE SECTION */}
      <div className="quote-container" style={{
        padding: '15px',
        margin: '10px 0 25px 0',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderLeft: '4px solid var(--accent)',
        fontStyle: 'italic'
      }}>
        <p style={{ margin: 0 }}>"{quote.text}"</p>
        <small style={{ color: 'var(--accent)' }}>— {quote.author}</small>
      </div>

      <h1>Uni Roadmap v2</h1>
      
      {error && <div style={{color: '#ff6b6b', textAlign: 'center', marginBottom:'10px'}}>{error}</div>}

      <TaskInput onAddTask={addTask} />
      
      <input 
        className="search-bar"
        placeholder="Search milestones..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {loading && tasks.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Syncing with server...</p>
      ) : (
        <TaskList 
          tasks={filteredTasks} 
          onIncrement={handleIncrement} 
          onDelete={deleteTask} 
        />
      )}

      <button className="reset-btn" onClick={handleReset}>
        Reset list
      </button>
    </>
  );
}

export default Home;