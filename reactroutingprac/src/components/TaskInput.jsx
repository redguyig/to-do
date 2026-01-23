// import { useState } from 'react';

// export default function TaskInput({ onAddTask }) {
//   const [text, setText] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;
//     onAddTask(text);
//     setText("");
//   };

//   return (
//     <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
//       <input 
//         type="text" 
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         placeholder="Add a new goal..."
//         style={{ flex: 1, padding: '0.8rem', borderRadius: '0.5rem', background: '#334155', border: 'none', color: 'white' }}
//       />
//       <button type="submit">Add</button>
//     </form>
//   );
// }
import { useState } from 'react';

export default function TaskInput({ onAddTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (title.trim()) {
      onAddTask(title, description);
      setTitle('');
      setDescription('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          style={{ flex: 1 }}
          placeholder="Add a new goal..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
      <input
        style={{ flex: 1 }}
        placeholder="Enter details for this goal..."
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
    </div>
  );
}