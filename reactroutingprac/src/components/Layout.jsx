import { Outlet } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import ProgressBar from './ProgressBar';

function Layout({ tasks, isDarkMode, onToggle }) {
  return (
    <div className="app-wrapper">
      <div className="glass-card">
        <ThemeToggle isDark={isDarkMode} onToggle={onToggle} />
        <ProgressBar tasks={tasks} />
        
        <hr style={{ opacity: 0.1, margin: '20px 0' }} />

        {/* This is where Home or Details will appear */}
        <Outlet /> 
        
      </div>
    </div>
  );
}

export default Layout   