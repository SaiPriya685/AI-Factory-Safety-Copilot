import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, ZoomIn, Eye } from 'lucide-react';
import { BACKEND_HTTP_URL } from '../services/api';

const Cameras = () => {
  const [cameras, setCameras] = useState([
    { id: 'CAM_A_01', name: 'PRIMARY ASSEMBLY - ZONE A', status: 'ACTIVE', fps: 30, resolution: '1080p', type: 'LIVE YOLO' },
    { id: 'CAM_B_02', name: 'LOGISTICS & LOADING DOCK', status: 'ACTIVE', fps: 28, resolution: '1080p', type: 'SYNTHETIC' },
    { id: 'CAM_C_03', name: 'HAZMAT & CHEMICAL STORAGE', status: 'WARNING', fps: 15, resolution: '720p', type: 'SYNTHETIC' },
    { id: 'CAM_D_04', name: 'PERIMETER FENCE - NORTH', status: 'INACTIVE', fps: 0, resolution: 'OFFLINE', type: 'STATIC' },
  ]);

  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [isHelmetOff, setIsHelmetOff] = useState(false);

  // References for synthetic canvas rendering (Cameras 2, 3, 4)
  const canvasRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Synthetic Animation Engine for non-live feeds
  useEffect(() => {
    const animationIds = [];

    const drawGrid = (ctx, width, height) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
    };

    // Render Canvas Feed for Cam 2
    const renderCam2 = () => {
      const cvs = canvasRefs[1].current;
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
      let frame = 0;

      const loop = () => {
        frame++;
        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        drawGrid(ctx, cvs.width, cvs.height);

        // Simulated Conveyor/Logistics Track
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 60, 320, 100);

        const x = (frame * 2) % 300 + 50;
        ctx.fillStyle = 'rgba(0, 242, 254, 0.2)';
        ctx.fillRect(x, 80, 40, 40);
        ctx.strokeStyle = '#00f2fe';
        ctx.strokeRect(x, 80, 40, 40);

        ctx.fillStyle = '#00f2fe';
        ctx.font = '10px monospace';
        ctx.fillText(`TRK_OBJ_ID: #${Math.floor(x)}`, x, 75);

        animationIds[1] = requestAnimationFrame(loop);
      };
      loop();
    };

    // Render Canvas Feed for Cam 3
    const renderCam3 = () => {
      const cvs = canvasRefs[2].current;
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
      let frame = 0;

      const loop = () => {
        frame++;
        ctx.fillStyle = '#0a0505';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        drawGrid(ctx, cvs.width, cvs.height);

        // Hazard Zone
        const pulse = Math.sin(frame * 0.05) * 0.2 + 0.3;
        ctx.fillStyle = `rgba(255, 0, 85, ${pulse})`;
        ctx.fillRect(100, 40, 220, 140);
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 1;
        ctx.strokeRect(100, 40, 220, 140);

        ctx.fillStyle = '#ff0055';
        ctx.font = '10px monospace';
        ctx.fillText('HAZARD ZONE B-12', 110, 60);

        animationIds[2] = requestAnimationFrame(loop);
      };
      loop();
    };

    // Render Canvas Feed for Cam 4 (Offline/Static)
    const renderCam4 = () => {
      const cvs = canvasRefs[3].current;
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
      ctx.fillStyle = '#030507';
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      ctx.fillStyle = '#ff4a4a';
      ctx.font = '12px monospace';
      ctx.fillText('SIGNAL LOST // NO FEED', 130, 110);
    };

    renderCam2();
    renderCam3();
    renderCam4();

    return () => animationIds.forEach(id => cancelAnimationFrame(id));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Camera size={18} color="var(--color-primary)" />
          <span style={{ fontWeight: 'bold', letterSpacing: '1px', fontSize: '13px' }}>SURVEILLANCE MATRIX</span>
          <span className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
            4 NODES ONLINE
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={12} /> RECONNECT ALL
          </button>
        </div>
      </div>

      {/* Main Grid: 2x2 Stream Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
        
        {/* Camera 1: LIVE YOLO WEBCAM STREAM */}
        <div className="panel" 
          onDoubleClick={() => setSelectedCameraId(0)}
          style={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            cursor: 'zoom-in',
            border: isHelmetOff ? '1px solid var(--color-warning)' : '1px solid var(--border-color)' 
          }}
        >
          {/* Top Label */}
          <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {cameras[0].id} : {cameras[0].name}
            </span>
            <span className="mono" style={{ fontSize: '9px', background: 'rgba(0,242,254,0.15)', color: 'var(--color-primary)', padding: '1px 5px', borderRadius: '2px' }}>
              LIVE AI
            </span>
          </div>

          {/* Video Stream Element */}
          <div style={{ position: 'relative', width: '100%', height: '220px', background: '#000', overflow: 'hidden' }}>
            <img 
              src={`${BACKEND_HTTP_URL}/api/ai/stream`} 
              alt="CAM_A_01 Live AI Stream" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                console.log("Reconnecting AI Stream...");
              }}
            />
          </div>

          {/* Telemetry Footer */}
          <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)' }}>
            <span className="mono">RESOLVED_TRK: 01</span>
            <span className="mono">PPE_ERRORS: {isHelmetOff ? '01' : '00'}</span>
            <span className="mono">SECTOR_STATE: {isHelmetOff ? 'WARN' : 'NOMINAL'}</span>
          </div>
        </div>

        {/* Camera 2: Synthetic Feed */}
        <div className="panel" 
          onDoubleClick={() => setSelectedCameraId(1)}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'zoom-in' }}
        >
          <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: '11px', fontWeight: 'bold' }}>{cameras[1].id} : {cameras[1].name}</span>
            <span className="mono" style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>SIMULATED</span>
          </div>
          <canvas ref={canvasRefs[1]} width={420} height={220} style={{ width: '100%', height: '220px', objectFit: 'contain' }} />
          <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)' }}>
            <span className="mono">RESOLVED_TRK: 04</span>
            <span className="mono">PPE_ERRORS: 00</span>
            <span className="mono">SECTOR_STATE: NOMINAL</span>
          </div>
        </div>

        {/* Camera 3: Synthetic Feed */}
        <div className="panel" 
          onDoubleClick={() => setSelectedCameraId(2)}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'zoom-in' }}
        >
          <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-warning)' }}>{cameras[2].id} : {cameras[2].name}</span>
            <span className="mono" style={{ fontSize: '9px', color: 'var(--color-warning)' }}>WARNING</span>
          </div>
          <canvas ref={canvasRefs[2]} width={420} height={220} style={{ width: '100%', height: '220px', objectFit: 'contain' }} />
          <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)' }}>
            <span className="mono">RESOLVED_TRK: 00</span>
            <span className="mono">PPE_ERRORS: 02</span>
            <span className="mono">SECTOR_STATE: ELEVATED</span>
          </div>
        </div>

        {/* Camera 4: Offline Feed */}
        <div className="panel" 
          onDoubleClick={() => setSelectedCameraId(3)}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'zoom-in', opacity: 0.7 }}
        >
          <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: '11px', fontWeight: 'bold', color: '#888' }}>{cameras[3].id} : {cameras[3].name}</span>
            <span className="mono" style={{ fontSize: '9px', color: '#ff4a4a' }}>OFFLINE</span>
          </div>
          <canvas ref={canvasRefs[3]} width={420} height={220} style={{ width: '100%', height: '220px', objectFit: 'contain' }} />
          <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)' }}>
            <span className="mono">RESOLVED_TRK: NONE</span>
            <span className="mono">PPE_ERRORS: N/A</span>
            <span className="mono">SECTOR_STATE: DISCONNECTED</span>
          </div>
        </div>

      </div>

      {/* Focus Modal Overlay (When Double-clicked) */}
      {selectedCameraId !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 7, 10, 0.95)', zIndex: 1000, display: 'flex',
          flexDirection: 'column', padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Eye color="var(--color-primary)" />
              <span className="mono" style={{ fontWeight: 'bold', fontSize: '16px' }}>
                FOCUS MONITORING // {cameras[selectedCameraId].id}
              </span>
            </div>
            <button className="btn" onClick={() => setSelectedCameraId(null)}>CLOSE MONITOR</button>
          </div>

          <div style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {selectedCameraId === 0 ? (
              <img 
                src="https://ai-factory-safety-copilot.onrender.com/api/ai/stream" 
                alt="Focused CAM_A_01 Stream" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            ) : (
              <canvas 
                ref={canvasRefs[selectedCameraId]} 
                width={840} 
                height={440} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cameras;
