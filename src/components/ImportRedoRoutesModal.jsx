import { useState } from 'react';

const ImportRedoRoutesModal = ({ onClose, onImport }) => {
  const [redoRoutes, setRedoRoutes] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    try {
      onImport(redoRoutes);
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to import RedoRoutes.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'var(--redwood-white)',
        borderRadius: '8px',
        boxSizing: 'border-box',
        maxHeight: '80vh',
        maxWidth: '80vw',
        padding: '20px',
        width: '80vw',
      }}>
        <h3 style={{ marginTop: 0 }}>Import RedoRoutes</h3>
        <textarea
          value={redoRoutes}
          onChange={(event) => {
            setRedoRoutes(event.target.value);
            setError('');
          }}
          spellCheck={false}
          style={{
            boxSizing: 'border-box',
            fontFamily: 'monospace',
            fontSize: '12px',
            height: '45vh',
            marginBottom: '12px',
            resize: 'vertical',
            width: '100%',
          }}
        />
        {error && (
          <div style={{
            color: 'var(--redwood-red)',
            marginBottom: '12px',
          }}>
            {error}
          </div>
        )}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
        }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleImport} disabled={!redoRoutes.trim()}>Build Graph</button>
        </div>
      </div>
    </div>
  );
};

export default ImportRedoRoutesModal;
