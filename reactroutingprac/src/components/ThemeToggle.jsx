export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button 
      onClick={onToggle}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        fontSize: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}