import React from 'react';

const CamerasPlaceholder = () => {
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
      <span style={{ fontSize: '48px', marginBottom: '16px' }}>📹</span>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Phase 2: Live Camera feeds</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', fontSize: '14px', lineHeight: '1.6' }}>
        In the next phase, we will mount simulated YOLO detection streams mapping real-time canvas bounding box tracking for Helmets, Areas, Falls, and Fires.
      </p>
    </div>
  );
};

export default CamerasPlaceholder;
