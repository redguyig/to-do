export default function ProgressBar({ tasks }) {
  // 1. Logic
  const total = tasks.length;
  const done = tasks.filter(t => t.isDone).length;
  const percentage = total > 0 ? (done / total) * 100 : 0;

  // Debugging: Right-click your browser > Inspect > Console to see this
  console.log(`Progress: ${done}/${total} (${percentage}%)`);

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>Completion</span>
        <span style={{ fontWeight: 'bold' }}>{Math.round(percentage)}%</span>
      </div>

      {/* The Background Bar */}
      <div style={{ 
        width: '100%', 
        height: '12px', 
        backgroundColor: '#334155', 
        borderRadius: '10px', 
        overflow: 'hidden' // This makes sure the inner bar stays rounded
      }}>
        {/* The Filling Bar */}
        <div style={{ 
          // CRITICAL: Ensure the percentage is followed by the % symbol
          width: `${percentage}%`, 
          height: '100%', 
          backgroundColor: '#22c55e', // Success Green
          borderRadius: '10px',
          transition: 'width 0.5s ease-in-out' 
        }} />
      </div>
    </div>
  );
}   