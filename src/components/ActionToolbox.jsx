import React, { useRef } from 'react';

const ActionToolbox = ({ onAddStandby, onAddFarSync, onAddRecoveryAppliance, onMakePrimary, selectedIsStandby, onExport, onImport, onClearAll, onShowRedoRoutes, onShowImportRedoRoutes, disableAdd, style }) => {
  const fileInputRef = useRef(null);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          onImport(data);
        } catch {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const defaultStyle = {
    alignItems: 'center',
    background: 'var(--redwood-white)',
    border: '1px solid var(--redwood-black)',
    boxSizing: 'border-box',
    display: 'flex',
    gap: '10px',
    padding: '8px 10px',
    width: '200px',
  };
  const combinedStyle = { ...defaultStyle, ...style };

  return (
    <div style={combinedStyle}>
      <h3 style={{ flexShrink: 0, margin: 0 }}>Actions</h3>
      <div style={{
        alignItems: 'center',
        display: 'flex',
        flex: '1 1 auto',
        gap: '8px',
        minWidth: 0,
        overflowX: 'auto',
        paddingBottom: '2px',
      }}>
        <button onClick={onAddStandby} disabled={disableAdd}>Add Standby</button>
        <button onClick={onAddFarSync} disabled={disableAdd}>Add Far Sync</button>
        <button onClick={onAddRecoveryAppliance} disabled={disableAdd}>Add Recovery Appliance</button>
        <button onClick={onMakePrimary} disabled={!selectedIsStandby}>Make Primary</button>
        <button onClick={onShowRedoRoutes}>Show RedoRoutes</button>
      </div>
      <details style={{ flexShrink: 0, position: 'relative' }}>
        <summary style={{
          backgroundColor: '#FCFBFA',
          border: '1px solid transparent',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1em',
          fontWeight: 500,
          listStyle: 'none',
          padding: '0.6em 1.0em',
          whiteSpace: 'nowrap',
        }}>
          Import/Export
        </summary>
        <div style={{
          background: 'var(--redwood-white)',
          border: '1px solid var(--redwood-black)',
          borderRadius: '6px',
          boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          left: 0,
          padding: '6px',
          position: 'absolute',
          top: 'calc(100% + 6px)',
          width: '190px',
          zIndex: 1001,
        }}>
          <button onClick={onExport}>Export JSON</button>
          <button onClick={() => fileInputRef.current?.click()}>Import JSON</button>
          <button onClick={onShowImportRedoRoutes}>Import RedoRoutes</button>
        </div>
      </details>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
      <div style={{
        display: 'flex',
        flexShrink: 0,
        marginLeft: 'auto',
      }}>
        <button onClick={onClearAll}>Clear all</button>
      </div>
    </div>
  );
};

export default ActionToolbox;
