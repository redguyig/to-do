import { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node styles - LARGER
const nodeStyles = {
  done: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: '3px solid #059669',
    borderRadius: '16px',
    padding: '20px 28px',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
    minWidth: '200px',
    textAlign: 'center',
    fontSize: '16px',
  },
  pending: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: '3px solid #2563eb',
    borderRadius: '16px',
    padding: '20px 28px',
    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
    minWidth: '200px',
    textAlign: 'center',
    fontSize: '16px',
  },
  start: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: 'white',
    border: '3px solid #7c3aed',
    borderRadius: '50%',
    padding: '20px',
    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
    width: '90px',
    height: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: '28px',
  }
};

function RoadmapFlow({ tasks }) {
  // Convert tasks to nodes and edges - HORIZONTAL layout
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { initialNodes: [], initialEdges: [] };
    }

    const nodes = [];
    const edges = [];
    const horizontalSpacing = 280;

    // Add start node
    nodes.push({
      id: 'start',
      data: { label: '🚀' },
      position: { x: 0, y: 60 },
      style: nodeStyles.start,
      type: 'default',
    });

    // Add task nodes in a HORIZONTAL flow
    tasks.forEach((task, index) => {
      const nodeId = task._id || task.id?.toString() || `task-${index}`;
      
      nodes.push({
        id: nodeId,
        data: { 
          label: (
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                {task.isDone ? '✅' : '⏳'} {task.title}
              </div>
            </div>
          )
        },
        position: { x: 140 + (index * horizontalSpacing), y: 50 },
        style: task.isDone ? nodeStyles.done : nodeStyles.pending,
      });

      // Connect to previous node
      const prevId = index === 0 ? 'start' : (tasks[index - 1]._id || tasks[index - 1].id?.toString() || `task-${index - 1}`);
      edges.push({
        id: `e-${prevId}-${nodeId}`,
        source: prevId,
        target: nodeId,
        animated: !task.isDone,
        style: { 
          stroke: task.isDone ? '#10b981' : '#3b82f6', 
          strokeWidth: 3 
        },
      });
    });

    // Add finish node
    if (tasks.length > 0) {
      const lastTask = tasks[tasks.length - 1];
      const lastId = lastTask._id || lastTask.id?.toString() || `task-${tasks.length - 1}`;
      const allDone = tasks.every(t => t.isDone);
      
      nodes.push({
        id: 'finish',
        data: { label: '🏆' },
        position: { x: 140 + (tasks.length * horizontalSpacing), y: 60 },
        style: {
          ...nodeStyles.start,
          background: allDone 
            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          border: allDone ? '3px solid #d97706' : '3px solid #4b5563',
        },
      });

      edges.push({
        id: `e-${lastId}-finish`,
        source: lastId,
        target: 'finish',
        animated: !allDone,
        style: { 
          stroke: allDone ? '#f59e0b' : '#6b7280', 
          strokeWidth: 3 
        },
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [tasks]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when tasks change
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (!tasks || tasks.length === 0) {
    return (
      <div style={{
        height: '350px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        color: 'var(--text-secondary, #888)',
        fontSize: '18px',
      }}>
        <p>Add tasks to see your roadmap flowchart! 📊</p>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '350px', 
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#444" gap={25} />
        <Controls 
          style={{ background: '#333', borderRadius: '8px' }} 
          showMiniMap={false}
        />
      </ReactFlow>
    </div>
  );
}

export default RoadmapFlow;