import {
  ReactFlow,
  Controls,
  Background,
  ConnectionLineType,
} from '@xyflow/react';

import DatabaseNode from './DatabaseNode';
import LadEdge from './LadEdge';
import PropertyPanel from './PropertyPanel';

const nodeTypes = {
  database: DatabaseNode,
};

const edgeTypes = {
  lad: LadEdge,
};

const TopologyCanvas = ({
  nodes,
  edges,
  allEdges,
  selectedNode,
  selectedEdge,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onNodesDelete,
  onEdgesDelete,
  onUpdateNode,
  onUpdateEdge,
}) => {
  return (
    <div style={{
      display: 'flex',
      flex: '1 1 auto',
      flexDirection: 'row',
      minHeight: 0,
      width: '100%',
    }}>
      <div style={{ flex: '1 1 auto', minWidth: 0, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode="loose"
          connectionLineType={ConnectionLineType.Straight}
          connectionLineStyle={{ stroke: 'var(--redwood-black)', strokeWidth: 1.5 }}
          fitView
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
      <PropertyPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        onUpdateNode={onUpdateNode}
        onUpdateEdge={onUpdateEdge}
        edges={allEdges}
        nodes={nodes}
        style={{
          borderLeft: '1px solid var(--redwood-black)',
          height: '100%',
          overflowY: 'auto',
          width: '20%',
        }}
      />
    </div>
  );
};

export default TopologyCanvas;
