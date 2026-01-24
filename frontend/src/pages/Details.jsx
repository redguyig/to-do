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
import { API_URL, DEVICE_ID } from '../config';

function Details() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // AI Suggestions state
  const [suggestions, setSuggestions] = useState(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        // GET /api/tasks/:id with deviceId
        const response = await axios.get(`${API_URL}/${taskId}`, {
          params: { deviceId: DEVICE_ID }
        });
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

  // Fetch AI suggestions when task loads
  const fetchSuggestions = async () => {
    if (!task) return;
    
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    
    try {
      const baseUrl = API_URL.replace('/tasks', '');
      const response = await axios.post(`${baseUrl}/suggestions`, {
        title: task.title,
        description: task.description
      });
      setSuggestions(response.data);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setSuggestionsError("Could not load AI suggestions. Try again later.");
    } finally {
      setSuggestionsLoading(false);
    }
  };

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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back to Roadmap
      </button>
      
      {/* Task Header */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '20px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ margin: '0 0 12px 0' }}>{task.title}</h2>
        
        <div className="status-badge" style={{
          display: 'inline-block',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '14px',
          background: task.isDone ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.2)',
          color: task.isDone ? '#4CAF50' : '#FFC107'
        }}>
          {task.isDone ? "✅ Completed" : "⏳ In Progress"}
        </div>
        
        <p style={{ marginTop: '16px', opacity: 0.85, lineHeight: 1.6 }}>
          {task.description || "No additional details provided for this milestone yet."}
        </p>
      </div>

      {/* AI Suggestions Section */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '20px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🤖</span> AI Learning Assistant
          </h3>
          <button
            onClick={fetchSuggestions}
            disabled={suggestionsLoading}
            style={{
              background: 'var(--accent, #00d4ff)',
              color: '#000',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: suggestionsLoading ? 'wait' : 'pointer',
              fontWeight: '600',
              opacity: suggestionsLoading ? 0.7 : 1
            }}
          >
            {suggestionsLoading ? '⏳ Loading...' : suggestions ? '🔄 Refresh' : '✨ Get Suggestions'}
          </button>
        </div>

        {suggestionsError && (
          <p style={{ color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', padding: '12px', borderRadius: '8px' }}>
            {suggestionsError}
          </p>
        )}

        {!suggestions && !suggestionsLoading && !suggestionsError && (
          <p style={{ opacity: 0.6, textAlign: 'center', padding: '30px' }}>
            Click "Get Suggestions" to get AI-powered learning resources for this task!
          </p>
        )}

        {suggestions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Summary */}
            {suggestions.summary && (
              <div style={{ background: 'rgba(0,212,255,0.1)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--accent, #00d4ff)' }}>
                <strong>📝 Overview:</strong>
                <p style={{ margin: '8px 0 0 0', lineHeight: 1.6 }}>{suggestions.summary}</p>
              </div>
            )}

            {/* Estimated Time */}
            {suggestions.estimatedTime && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                <span>⏱️</span> <strong>Estimated Learning Time:</strong> {suggestions.estimatedTime}
              </div>
            )}

            {/* Resources */}
            {suggestions.resources && suggestions.resources.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '12px' }}>📚 Learning Resources</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {suggestions.resources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '14px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',
                        transition: 'background 0.2s',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>
                          {resource.type === 'documentation' ? '📖' : resource.type === 'tutorial' ? '🎓' : '📄'}
                        </span>
                        <strong style={{ color: 'var(--accent, #00d4ff)' }}>{resource.name}</strong>
                        <span style={{ 
                          fontSize: '11px', 
                          background: 'rgba(255,255,255,0.1)', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {resource.type}
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0 26px', fontSize: '14px', opacity: 0.7 }}>
                        {resource.description}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube Search */}
            {suggestions.youtubeSearchTerms && suggestions.youtubeSearchTerms.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '12px' }}>🎬 YouTube Tutorials</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {suggestions.youtubeSearchTerms.map((term, idx) => (
                    <a
                      key={idx}
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(255,0,0,0.15)',
                        color: '#ff6b6b',
                        padding: '8px 14px',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      ▶️ {term}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {suggestions.tips && suggestions.tips.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '12px' }}>💡 Pro Tips</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {suggestions.tips.map((tip, idx) => (
                    <li key={idx} style={{ lineHeight: 1.5 }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Details;