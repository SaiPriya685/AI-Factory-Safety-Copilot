import React from 'react';

const CopilotPlaceholder = () => {
  return (
    <div className="glass" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      textAlign: 'center',
      borderStyle: 'dashed'
    }}>
      <span style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</span>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Phase 3: AI Safety Copilot</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', fontSize: '14px', lineHeight: '1.6' }}>
        In the next phase, we will implement the AI Assistant Chat Console supporting query chips, response markdown, and dynamic log searches.
      </p>
    </div>
  );
};

export default CopilotPlaceholder;
