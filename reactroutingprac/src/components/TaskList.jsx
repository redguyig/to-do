import { Link } from 'react-router-dom';

export default function TaskList({ tasks, onIncrement, onDelete }) {
  const currentGoal = tasks.find((t) => !t.isDone);

  return (
    <div style={{ textAlign: "left" }}>
      {/* --- SECTION 1: THE FOCUS CARD --- */}
      <div style={{ background: "rgba(0,0,0,0.2)", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <small style={{ color: "var(--accent)" }}>Next Step:</small>
        
        {/* CHANGE 1: Wrap the Focus Card title in a Link */}
        <h2 style={{ margin: "10px 0" }}>
          {currentGoal ? (
            <Link to={`/task/${currentGoal.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {currentGoal.title} →
            </Link>
          ) : (
            "All Milestones Reached! 🚀"
          )}
        </h2>

        {currentGoal && (
          <button onClick={onIncrement} style={{ width: "100%", padding: "12px" }}>
            Mark as Completed
          </button>
        )}
      </div>

      {/* --- SECTION 2: THE LIST --- */}
      <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>Roadmap Details</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li key={task.id} style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "10px 0", 
            borderBottom: "1px solid rgba(255,255,255,0.1)" 
          }}>
            
            {/* CHANGE 2: Wrap the task title in a Link component */}
            <Link 
              to={`/task/${task.id}`} 
              style={{ 
                textDecoration: task.isDone ? "line-through" : "none",
                color: task.isDone ? "var(--text-secondary)" : "var(--text-primary)",
                flexGrow: 1 // This makes the whole text area clickable
              }}
            >
              {task.isDone ? "✅ " : "⏳ "}{task.title}
            </Link>

            <button 
              className="delete-btn" 
              onClick={(e) => {
                e.preventDefault(); // Prevents the Link from triggering when deleting
                onDelete(task.id);
              }}
              style={{ backgroundColor: "var(--delete-bg)", color: "var(--delete-text)", padding: "5px 10px", borderRadius: "5px", border: "none", marginLeft: "10px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}