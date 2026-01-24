import { Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Task Item Component
function SortableTaskItem({ task, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    background: isDragging ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
    borderRadius: isDragging ? '8px' : '0',
    cursor: 'grab',
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes}>
      {/* Drag Handle */}
      <span 
        {...listeners} 
        style={{ 
          cursor: 'grab', 
          marginRight: '12px', 
          fontSize: '18px',
          color: 'var(--text-secondary)',
          userSelect: 'none',
        }}
      >
        ⋮⋮
      </span>

      {/* Task Link */}
      <Link
        to={`/task/${task._id}`}
        style={{
          textDecoration: task.isDone ? 'line-through' : 'none',
          color: task.isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
          flexGrow: 1,
        }}
      >
        {task.isDone ? '✅ ' : '⏳ '}{task.title}
      </Link>

      {/* Delete Button */}
      <button
        className="delete-btn"
        onClick={(e) => {
          e.preventDefault();
          onDelete(task._id);
        }}
        style={{
          backgroundColor: 'var(--delete-bg)',
          color: 'var(--delete-text)',
          padding: '5px 10px',
          borderRadius: '5px',
          border: 'none',
          marginLeft: '10px',
          cursor: 'pointer',
        }}
      >
        Delete
      </button>
    </li>
  );
}

export default function TaskList({ tasks, onIncrement, onDelete, onReorder }) {
  const currentGoal = tasks.find((t) => !t.isDone);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((t) => t._id === active.id);
      const newIndex = tasks.findIndex((t) => t._id === over.id);
      const newOrder = arrayMove(tasks, oldIndex, newIndex);
      
      if (onReorder) {
        onReorder(newOrder);
      }
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      {/* --- SECTION 1: THE FOCUS CARD --- */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <small style={{ color: 'var(--accent)' }}>Next Step:</small>

        <h2 style={{ margin: '10px 0' }}>
          {currentGoal ? (
            <Link to={`/task/${currentGoal._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {currentGoal.title} →
            </Link>
          ) : (
            'All Milestones Reached! 🚀'
          )}
        </h2>

        {currentGoal && (
          <button onClick={onIncrement} style={{ width: '100%', padding: '12px' }}>
            Mark as Completed
          </button>
        )}
      </div>

      {/* --- SECTION 2: THE DRAGGABLE LIST --- */}
      <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
        Roadmap Details <small style={{ opacity: 0.6 }}>(drag to reorder)</small>
      </h3>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tasks.map((task) => (
              <SortableTaskItem key={task._id} task={task} onDelete={onDelete} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}