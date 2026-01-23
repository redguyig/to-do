// import { useParams, useNavigate } from 'react-router-dom';



// function Details({ tasks }) {
//   const { taskId } = useParams();
//   const navigate = useNavigate();

//   // Find the specific task based on the ID in the URL
//   const task = tasks.find(t => t.id.toString() === taskId);

//   if (!task) return <div className="glass-card">Task not found!</div>;

//   return (
//     <>
//       <button className="back-btn" onClick={() => navigate('/')}>← Back to Roadmap</button>
//       <h2>{task.title}</h2>
//       <div className="status-badge">
//         Status: {task.isDone ? "✅ Completed" : "⏳ In Progress"}
//       </div>
//       <p className="description-text">
//         {task.description || "No additional details provided for this milestone yet."}
//       </p>
//     </>
//   );
// }

// export default Details;

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Ensure this matches your backend port/route
const API_URL = "http://localhost:5000/api/tasks";

function Details() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        // GET /api/tasks/:id
        const response = await axios.get(`${API_URL}/${taskId}`);
        setTask(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching task details:", err);
        setError("Task not found or server is unreachable.");
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  // 1. Loading State
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading details...</div>;
  }

  // 2. Error State (Task not found or server down)
  if (error || !task) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        {/* Helper to go back if the link is broken */}
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Roadmap
        </button>
      </div>
    );
  }

  // 3. Success State (Render UI)
  return (
    <>
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back to Roadmap
      </button>
      
      <h2>{task.title}</h2>
      
      <div className="status-badge">
        Status: {task.isDone ? "✅ Completed" : "⏳ In Progress"}
      </div>
      
      <p className="description-text">
        {task.description || "No additional details provided for this milestone yet."}
      </p>

      {/* Optional: Add Last Updated date if your DB supports it */}
      {/* <small style={{ opacity: 0.5 }}>ID: {task.id}</small> */}
    </>
  );
}

export default Details;