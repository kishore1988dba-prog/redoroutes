import '@xyflow/react/dist/style.css';

import ActionToolbox from './components/ActionToolbox';
import HelpText from './components/HelpText';
import ImportRedoRoutesModal from './components/ImportRedoRoutesModal';
import RedoRoutesModal from './components/RedoRoutesModal';
import TopologyCanvas from './components/TopologyCanvas';
import { useTopologyState } from './hooks/useTopologyState';

function App() {
  const topology = useTopologyState();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      overflow: 'hidden',
      width: '100vw',
    }}>
      <HelpText />
      <div style={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        minHeight: 0,
        width: '100%',
      }}>
        <ActionToolbox
          onAddStandby={topology.onAddStandby}
          onAddFarSync={topology.onAddFarSync}
          onAddRecoveryAppliance={topology.onAddRecoveryAppliance}
          onMakePrimary={topology.onMakePrimary}
          selectedIsStandby={topology.selectedIsStandby}
          onExport={topology.onExport}
          onImport={topology.onImport}
          onClearAll={topology.onClearAll}
          onShowRedoRoutes={topology.showRedoRoutes}
          onShowImportRedoRoutes={topology.showImportRedoRoutes}
          disableAdd={topology.nodes.length >= 127}
          style={{
            borderBottom: '1px solid var(--redwood-black)',
            flexShrink: 0,
            minHeight: '60px',
            width: '100%',
          }}
        />
        <TopologyCanvas
          nodes={topology.nodesWithWarnings}
          edges={topology.visibleEdges}
          allEdges={topology.edges}
          selectedNode={topology.selectedNode}
          selectedEdge={topology.selectedEdge}
          onNodesChange={topology.onNodesChange}
          onEdgesChange={topology.onEdgesChange}
          onConnect={topology.onConnect}
          onNodeClick={topology.onNodeClick}
          onEdgeClick={topology.onEdgeClick}
          onNodesDelete={topology.onNodesDelete}
          onEdgesDelete={topology.onEdgesDelete}
          onUpdateNode={topology.onUpdateNode}
          onUpdateEdge={topology.onUpdateEdge}
        />
        {topology.showRedoRoutesModal && (
          <RedoRoutesModal
            statements={topology.dgmgrlStatements}
            onClose={topology.hideRedoRoutes}
          />
        )}
        {topology.showImportRedoRoutesModal && (
          <ImportRedoRoutesModal
            onClose={topology.hideImportRedoRoutes}
            onImport={topology.onImportRedoRoutes}
          />
        )}
      </div>
    </div>
  );
}

export default App;
