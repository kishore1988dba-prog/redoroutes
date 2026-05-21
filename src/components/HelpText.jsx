import { useState } from 'react';

const tutorialSteps = [
  {
    title: 'Start from a topology or existing RedoRoutes',
    body: 'Add standby databases, Far Syncs, and Recovery Appliances from the Actions bar, or open Import/Export and paste existing RedoRoutes statements with Import RedoRoutes. The importer builds the graph for you so you can review or adjust it visually.',
  },
  {
    title: 'Name every member',
    body: 'Click each database, Far Sync, or Recovery Appliance and set its DB_UNIQUE_NAME in the properties panel. You can rename members later; connections are tracked internally and RedoRoutes are generated from the current names.',
  },
  {
    title: 'Draw redo paths',
    body: 'Drag from the edge of one member to another member to create a redo transport connection. Handles are automatic around the node perimeter, and show as green outlines when you move the mouse over nodes.',
  },
  {
    title: 'Tune each connection',
    body: 'Click a connection to set LogXptMode, Priority, and Alternate To. Use Alternate To when a source has multiple destinations and one destination should be the alternate for another.',
  },
  {
    title: 'Check every primary role',
    body: 'After completing the topology for one primary database, select a standby database and click Make Primary. The canvas switches to the topology for that primary, while warnings help spot missing or invalid paths.',
  },
  {
    title: 'Generate and reuse the result',
    body: 'When the possible primary topologies are ready, click Show RedoRoutes to generate the DGMGRL statements. You can copy the statements, export the topology as JSON, import JSON later, or clear everything and start again.',
  },
];

const buttonStyle = {
  backgroundColor: 'var(--redwood-red)',
  color: 'var(--redwood-white)',
  flexShrink: 0,
};

const HelpText = () => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = tutorialSteps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === tutorialSteps.length - 1;

  const startTutorial = () => {
    setStepIndex(0);
    setIsTutorialOpen(true);
  };

  const closeTutorial = () => {
    setIsTutorialOpen(false);
    setStepIndex(0);
  };

  return (
    <section style={{
      borderBottom: '1px solid var(--redwood-black)',
      boxSizing: 'border-box',
      flexShrink: 0,
      padding: '18px 24px',
      width: '100%',
    }}>
      <div style={{
        alignItems: 'flex-start',
        display: 'flex',
        gap: '18px',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 8px' }}>ADG-Topology - RedoRoutes Helper</h1>
          <p style={{ margin: 0 }}>
            This 100% frontend application helps you design Data Guard topologies,
            import existing RedoRoutes, and generate the DGMGRL statements needed
            to configure redo transport.
          </p>
        </div>
        <button type="button" onClick={startTutorial} style={buttonStyle}>
          Start the tutorial
        </button>
      </div>

      {isTutorialOpen && (
        <div style={{
          background: 'var(--redwood-white)',
          border: '1px solid var(--redwood-black)',
          borderRadius: '8px',
          boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
          marginTop: '16px',
          maxWidth: '920px',
          padding: '16px',
        }}>
          <div style={{
            color: 'var(--redwood-grey)',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '6px',
          }}>
            Step {stepIndex + 1} of {tutorialSteps.length}
          </div>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 8px' }}>{currentStep.title}</h2>
          <p style={{ margin: '0 0 16px' }}>{currentStep.body}</p>

          <div style={{
            alignItems: 'center',
            display: 'flex',
            gap: '8px',
            justifyContent: 'space-between',
          }}>
            <div style={{
              display: 'flex',
              gap: '6px',
            }}>
              {tutorialSteps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  aria-label={`Go to tutorial step ${index + 1}`}
                  onClick={() => setStepIndex(index)}
                  style={{
                    background: index === stepIndex ? 'var(--redwood-red)' : 'var(--redwood-white)',
                    borderColor: index === stepIndex ? 'var(--redwood-red)' : 'var(--redwood-grey)',
                    borderRadius: '50%',
                    color: index === stepIndex ? 'var(--redwood-white)' : 'var(--redwood-black)',
                    height: '28px',
                    padding: 0,
                    width: '28px',
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={closeTutorial}>
                Close
              </button>
              <button type="button" onClick={() => setStepIndex(stepIndex - 1)} disabled={isFirstStep}>
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isLastStep) {
                    closeTutorial();
                    return;
                  }
                  setStepIndex(stepIndex + 1);
                }}
              >
                {isLastStep ? 'Done' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      <p style={{ fontSize: '0.9rem', margin: '12px 0 0' }}>
        This tool runs entirely in your browser. No topology data is sent to any
        server, and persisted data is only stored in your browser. Ideas or issues?
        Open them on the{' '}
        <a href="https://github.com/ludovicocaldara/adg-topology">
          GitHub repository
        </a>.
      </p>
    </section>
  );
};

export default HelpText;
