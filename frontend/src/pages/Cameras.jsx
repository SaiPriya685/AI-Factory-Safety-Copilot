import React, { useEffect, useRef, useState } from 'react';
import { useSafety } from '../context/SafetyContext';

const Cameras = () => {
  const { alerts, globalStatus } = useSafety();

  // Reference for the 4 canvas streams
  const canvasRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Active exceptions flags
  const isHelmetOff = alerts.some(a => a.type === 'PPE Violation' && a.level === 'warning');
  const isTrespass = alerts.some(a => a.type === 'Restricted Area Entry' && a.level === 'critical');
  const isFall = alerts.some(a => a.type === 'Fall Detected' && a.level === 'critical');
  const isFire = alerts.some(a => a.type === 'Fire Detector Triggered' && a.level === 'critical');

  // Trailing coordinates history for vector lines
  const trail1Ref = useRef([]);
  const trail2Ref = useRef([]);

  // Persistent worker tracking coordinates stored in useRef to prevent resetting on alert updates
  const worker1XRef = useRef(60);
  const worker1DirRef = useRef(1);
  const worker2XRef = useRef(90);
  const worker2YRef = useRef(70);
  const fallWorkerYRef = useRef(70);

  // Local state to hold camera events (surveillance ticker feed)
  const [cameraLogs, setCameraLogs] = useState([
    { id: 1, time: '13:04:12', cam: 'CAM_A_01', text: 'INIT_SECTOR_SELF_TEST: PASSED', level: 'safe' },
    { id: 2, time: '13:04:15', cam: 'CAM_B_02', text: 'RADAR_GRID_PROXIMITY: NOMINAL', level: 'safe' }
  ]);

  // Sync contextual alerts to camera-specific surveillance logs
  useEffect(() => {
    const syncLogs = alerts.map(a => {
      let camId = 'SYSTEM';
      if (a.zone === 'A') camId = 'CAM_A_01';
      else if (a.zone === 'B') camId = 'CAM_B_02';
      else if (a.zone === 'C') camId = 'CAM_C_03';
      else if (a.zone === 'D') camId = 'CAM_D_04';

      return {
        id: a.id,
        time: a.time,
        cam: camId,
        text: `${a.type.toUpperCase()}: ${a.message}`,
        level: a.level
      };
    });
    
    if (syncLogs.length === 0) {
      setCameraLogs([
        { id: 1, time: '13:04:12', cam: 'CAM_A_01', text: 'INIT_SECTOR_SELF_TEST: PASSED', level: 'safe' }
      ]);
    } else {
      setCameraLogs(syncLogs);
    }
  }, [alerts]);

  useEffect(() => {
    let animationFrameId;
    let tick = 0;

    const render = () => {
      tick += 1;
      const now = new Date();
      const liveTimestamp = now.toISOString().replace('T', ' ').substring(0, 19) + '.' + now.getMilliseconds().toString().padStart(3, '0');

      // ----------------------------------------------------
      // CAMERA 1: HELMET COMPLIANCE (Sector A)
      // ----------------------------------------------------
      const canvas1 = canvasRefs[0].current;
      if (canvas1) {
        const ctx = canvas1.getContext('2d');
        const w = canvas1.width;
        const h = canvas1.height;

        ctx.fillStyle = '#06080c';
        ctx.fillRect(0, 0, w, h);
        
        ctx.strokeStyle = '#0e1217';
        ctx.lineWidth = 0.8;
        for (let i = -100; i < w + 200; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i - 100, h);
          ctx.stroke();
        }
        for (let i = 20; i < h; i += 20) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(w, i);
          ctx.stroke();
        }

        ctx.strokeStyle = '#121923';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 20); ctx.lineTo(40, h - 20);
        ctx.moveTo(w - 40, 20); ctx.lineTo(w - 40, h - 20);
        ctx.stroke();

        // Move worker (using persistent refs to maintain coordinate positions across alerts)
        worker1XRef.current += worker1DirRef.current * 0.7;
        if (worker1XRef.current > w - 120 || worker1XRef.current < 40) {
          worker1DirRef.current *= -1;
        }

        const workerY = h - 60;
        const targetX = worker1XRef.current + 9;
        const targetY = workerY + 12;

        trail1Ref.current.push({ x: targetX, y: targetY });
        if (trail1Ref.current.length > 20) trail1Ref.current.shift();

        // Draw tracking trail line
        ctx.strokeStyle = 'rgba(138, 144, 153, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        trail1Ref.current.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.setLineDash([]); 

        // Bounding Box brackets
        ctx.strokeStyle = isHelmetOff ? 'var(--color-warning)' : 'var(--color-safe)';
        ctx.lineWidth = 1.5;
        const boxW = 32;
        const boxH = 64;
        const boxX = worker1XRef.current - 7;
        const boxY = workerY - 20;

        drawHUDBrackets(ctx, boxX, boxY, boxW, boxH);

        // Center dot
        ctx.fillStyle = isHelmetOff ? 'var(--color-warning)' : 'var(--color-safe)';
        ctx.beginPath();
        ctx.arc(targetX, targetY, 2, 0, Math.PI * 2);
        ctx.fill();

        // YOLO-style Class Bounding Box Label
        ctx.fillStyle = isHelmetOff ? 'var(--color-warning)' : 'var(--color-safe)';
        ctx.font = '500 8.5px var(--font-mono)';
        const labelText = isHelmetOff 
          ? '[ID:0824] Person:98% | Helmet:0%' 
          : '[ID:0824] Person:98% | Helmet:96%';
        
        ctx.fillRect(boxX, boxY - 12, ctx.measureText(labelText).width + 6, 12);
        ctx.fillStyle = '#0B0D10';
        ctx.fillText(labelText, boxX + 3, boxY - 3);

        ctx.fillStyle = '#8A9099';
        ctx.fillText(`X:${targetX.toFixed(1)} Y:${targetY.toFixed(1)}`, boxX, boxY + boxH + 10);

        drawCameraHUD(ctx, w, h, 'CAM_A_01', 'SEC_A // ASSEMBLY_FLOOR', isHelmetOff ? 'WARN' : 'NOMINAL', 1, isHelmetOff ? 0 : 100, liveTimestamp, tick);
      }

      // ----------------------------------------------------
      // CAMERA 2: RESTRICTED ZONE DETECT (Sector B)
      // ----------------------------------------------------
      const canvas2 = canvasRefs[1].current;
      if (canvas2) {
        const ctx = canvas2.getContext('2d');
        const w = canvas2.width;
        const h = canvas2.height;

        ctx.fillStyle = '#06080c';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#0e1217';
        ctx.lineWidth = 0.8;
        for (let i = -100; i < w + 200; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i - 100, h);
          ctx.stroke();
        }

        // Draw Restricted Boundary Polygon
        ctx.strokeStyle = isTrespass ? 'var(--color-critical)' : 'rgba(138, 144, 153, 0.4)';
        ctx.fillStyle = isTrespass ? 'rgba(226, 76, 76, 0.04)' : 'rgba(138, 144, 153, 0.01)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 40, h / 2 - 20);
        ctx.lineTo(w - 40, h / 2 + 10);
        ctx.lineTo(w - 70, h - 20);
        ctx.lineTo(w / 2 - 60, h - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isTrespass ? 'var(--color-critical)' : 'var(--text-secondary)';
        ctx.font = '500 8px var(--font-mono)';
        ctx.fillText('RESTRICTED_CRANE_ZONE_B', w / 2 - 35, h / 2 - 12);

        // Move Worker B
        if (!isTrespass) {
          worker2XRef.current = 60 + Math.sin(tick * 0.02) * 20;
          worker2YRef.current = h - 60 + Math.cos(tick * 0.02) * 10;
        } else {
          worker2XRef.current = w / 2 + 10;
          worker2YRef.current = h / 2 + 20;
        }

        const targetX = worker2XRef.current + 8;
        const targetY = worker2YRef.current + 12;

        trail2Ref.current.push({ x: targetX, y: targetY });
        if (trail2Ref.current.length > 20) trail2Ref.current.shift();

        // Draw tracking trail line
        ctx.strokeStyle = 'rgba(138, 144, 153, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        trail2Ref.current.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.setLineDash([]); 

        // Bounding Box brackets
        ctx.strokeStyle = isTrespass ? 'var(--color-critical)' : 'var(--color-safe)';
        ctx.lineWidth = 1.5;
        const boxW = 28;
        const boxH = 56;
        const boxX = worker2XRef.current - 6;
        const boxY = worker2YRef.current - 16;

        drawHUDBrackets(ctx, boxX, boxY, boxW, boxH);

        // Center dot
        ctx.fillStyle = isTrespass ? 'var(--color-critical)' : 'var(--color-safe)';
        ctx.beginPath();
        ctx.arc(targetX, targetY, 2, 0, Math.PI * 2);
        ctx.fill();

        // YOLO-style Class Bounding Box Label
        ctx.fillStyle = isTrespass ? 'var(--color-critical)' : 'var(--color-safe)';
        ctx.font = '500 8.5px var(--font-mono)';
        const labelText = isTrespass 
          ? '[ID:1094] Person:99% | Trespass:100%' 
          : '[ID:1094] Person:99% | Trespass:0%';
        
        ctx.fillRect(boxX, boxY - 12, ctx.measureText(labelText).width + 6, 12);
        ctx.fillStyle = '#0B0D10';
        ctx.fillText(labelText, boxX + 3, boxY - 3);

        ctx.fillStyle = '#8A9099';
        ctx.fillText(`X:${targetX.toFixed(1)} Y:${targetY.toFixed(1)}`, boxX, boxY + boxH + 10);

        drawCameraHUD(ctx, w, h, 'CAM_B_02', 'SEC_B // LOADING_DOCK', isTrespass ? 'ALERT' : 'NOMINAL', 1, isTrespass ? 0 : 100, liveTimestamp, tick);
      }

      // ----------------------------------------------------
      // CAMERA 3: WORKER FALL MONITOR (Sector C)
      // ----------------------------------------------------
      const canvas3 = canvasRefs[2].current;
      if (canvas3) {
        const ctx = canvas3.getContext('2d');
        const w = canvas3.width;
        const h = canvas3.height;

        ctx.fillStyle = '#06080c';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#0e1217';
        ctx.lineWidth = 0.8;
        for (let i = -100; i < w + 200; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i - 100, h);
          ctx.stroke();
        }

        ctx.strokeStyle = '#121923';
        ctx.lineWidth = 1;
        ctx.strokeRect(30, h - 30, w - 60, 20);
        ctx.strokeRect(60, h - 60, w - 120, 30);

        // Fall Worker movement
        if (isFall) {
          fallWorkerYRef.current = h - 25;
        } else {
          fallWorkerYRef.current = h - 75;
        }

        const worker3X = w / 2 - 10;
        const targetX = worker3X + 8;
        const targetY = fallWorkerYRef.current + (isFall ? 7 : 12);

        // Bounding Box brackets
        ctx.strokeStyle = isFall ? 'var(--color-critical)' : 'var(--color-safe)';
        ctx.lineWidth = 1.5;
        const boxW = isFall ? 56 : 28;
        const boxH = isFall ? 28 : 56;
        const boxX = worker3X - (isFall ? 20 : 6);
        const boxY = fallWorkerYRef.current - (isFall ? 14 : 16);

        drawHUDBrackets(ctx, boxX, boxY, boxW, boxH);

        // Center dot
        ctx.fillStyle = isFall ? 'var(--color-critical)' : 'var(--color-safe)';
        ctx.beginPath();
        ctx.arc(targetX, targetY, 2, 0, Math.PI * 2);
        ctx.fill();

        // YOLO-style Class Bounding Box Label
        ctx.fillStyle = isFall ? 'var(--color-critical)' : 'var(--color-safe)';
        ctx.font = '500 8.5px var(--font-mono)';
        const labelText = isFall 
          ? '[ID:3911] Person:99% | Fall:98%' 
          : '[ID:3911] Person:99% | Posture:Nominal';
        
        ctx.fillRect(boxX, boxY - 12, ctx.measureText(labelText).width + 6, 12);
        ctx.fillStyle = '#0B0D10';
        ctx.fillText(labelText, boxX + 3, boxY - 3);

        ctx.fillStyle = '#8A9099';
        ctx.fillText(`X:${targetX.toFixed(1)} Y:${targetY.toFixed(1)}`, boxX, boxY + boxH + 10);

        drawCameraHUD(ctx, w, h, 'CAM_C_03', 'SEC_C // SCAFFOLD_ZONE', isFall ? 'ALERT' : 'NOMINAL', 1, isFall ? 0 : 100, liveTimestamp, tick);
      }

      // ----------------------------------------------------
      // CAMERA 4: THERMAL COMBUSTION (Sector D)
      // ----------------------------------------------------
      const canvas4 = canvasRefs[3].current;
      if (canvas4) {
        const ctx = canvas4.getContext('2d');
        const w = canvas4.width;
        const h = canvas4.height;

        ctx.fillStyle = '#06080c';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#0b1118';
        ctx.fillRect(20, h / 2 - 20, w - 40, 15);
        ctx.strokeStyle = '#121923';
        ctx.strokeRect(20, h / 2 - 20, w - 40, 15);

        const heatX = w / 2 - 10;
        const heatY = h / 2;

        if (isFire) {
          const maxRadius = 30 + Math.sin(tick * 0.15) * 8;
          ctx.fillStyle = 'rgba(226, 76, 76, 0.4)';
          ctx.beginPath();
          ctx.arc(heatX, heatY, maxRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(224, 166, 60, 0.6)';
          ctx.beginPath();
          ctx.arc(heatX, heatY, maxRadius * 0.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.arc(heatX, heatY, maxRadius * 0.3, 0, Math.PI * 2);
          ctx.fill();

          // YOLO target box brackets
          ctx.strokeStyle = 'var(--color-critical)';
          ctx.lineWidth = 1.5;
          const boxX = heatX - maxRadius - 2;
          const boxY = heatY - maxRadius - 2;
          const boxW = maxRadius * 2 + 4;
          const boxH = maxRadius * 2 + 4;
          
          drawHUDBrackets(ctx, boxX, boxY, boxW, boxH);

          // YOLO-style Class Bounding Box Label
          ctx.fillStyle = 'var(--color-critical)';
          ctx.font = '500 8.5px var(--font-mono)';
          const labelText = '[ID:0084] Flame:99% | Temp:184.2°C';
          
          ctx.fillRect(boxX, boxY - 12, ctx.measureText(labelText).width + 6, 12);
          ctx.fillStyle = '#0B0D10';
          ctx.fillText(labelText, boxX + 3, boxY - 3);
        } else {
          ctx.fillStyle = '#0b1118';
          ctx.beginPath();
          ctx.arc(heatX, heatY, 8, 0, Math.PI * 2);
          ctx.fill();

          // YOLO-style Class Bounding Box Label
          ctx.fillStyle = 'var(--color-safe)';
          ctx.font = '500 8.5px var(--font-mono)';
          const labelText = '[ID:0084] HeatSignature:Nominal (28.4°C)';
          
          ctx.fillRect(heatX - 40, heatY - 25, ctx.measureText(labelText).width + 6, 12);
          ctx.fillStyle = '#0B0D10';
          ctx.fillText(labelText, heatX - 37, heatY - 16);
        }

        drawCameraHUD(ctx, w, h, 'CAM_D_04', 'SEC_D // POWER_ANNEX', isFire ? 'ALERT' : 'NOMINAL', 0, isFire ? 0 : 100, liveTimestamp, tick);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHelmetOff, isTrespass, isFall, isFire]);

  // Helper function to draw CCTV corner brackets [ ]
  const drawHUDBrackets = (ctx, x, y, w, h) => {
    const len = 6;
    ctx.beginPath();
    // Top Left
    ctx.moveTo(x + len, y); ctx.lineTo(x, y); ctx.lineTo(x, y + len);
    // Top Right
    ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
    // Bottom Left
    ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
    // Bottom Right
    ctx.moveTo(x + w - len, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - len);
    ctx.stroke();
  };

  // Helper function to draw CCTV OSD HUD overlays
  const drawCameraHUD = (ctx, w, h, camId, locName, statusText, targetCount, safetyScore, timestamp, tick) => {
    ctx.fillStyle = 'rgba(11, 13, 16, 0.9)';
    ctx.fillRect(0, 0, w, 18);

    // Blinking OSD Status dot
    const isVisible = Math.floor(Date.now() / 600) % 2 === 0;
    if (isVisible) {
      ctx.fillStyle = statusText === 'NOMINAL' ? 'var(--color-safe)' : statusText === 'WARN' ? 'var(--color-warning)' : 'var(--color-critical)';
      ctx.beginPath();
      ctx.arc(10, 9, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#E8EAED';
    ctx.font = '600 8.5px var(--font-title)';
    ctx.fillText(camId, 18, 12);
    
    ctx.fillStyle = '#8A9099';
    ctx.font = '500 8px var(--font-mono)';
    ctx.fillText(locName, 75, 12);

    // Latency simulation jitter (12ms - 15ms)
    const simulatedLatency = (12 + (tick % 4)).toFixed(0);
    ctx.fillText(`LATENCY: ${simulatedLatency}ms | CODEC: H.265 / 4.2Mbps`, w - 215, 12);

    const fps = (29.9).toFixed(1);
    ctx.fillText(`${fps} FPS`, w - 45, 12);

    ctx.fillStyle = 'rgba(11, 13, 16, 0.9)';
    ctx.fillRect(0, h - 18, w, 18);

    ctx.fillStyle = '#8A9099';
    ctx.font = '500 7.5px var(--font-mono)';
    ctx.fillText(timestamp, 10, h - 6);
    ctx.fillText(`TARGETS_VAL: 0${targetCount}`, w / 2 - 40, h - 6);
    
    const scoreColor = safetyScore === 100 ? 'var(--color-safe)' : safetyScore >= 90 ? 'var(--color-warning)' : 'var(--color-critical)';
    ctx.fillStyle = '#8A9099';
    ctx.fillText(`CAM_SCORE: `, w - 110, h - 6);
    ctx.fillStyle = scoreColor;
    ctx.fillText(`${safetyScore.toFixed(1)}%`, w - 45, h - 6);

    if (statusText === 'ALERT') {
      const flash = Math.floor(Date.now() / 350) % 2 === 0;
      if (flash) {
        ctx.strokeStyle = 'var(--color-critical)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, 0, w, h);
      }
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '3.1fr 1fr',
      gap: '16px',
      height: '100%',
      overflow: 'hidden'
    }}>
      
      {/* LEFT COLUMN: 2x2 CCTV Matrix Grid */}
      <div className="panel" style={{ height: '100%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
        
        {/* Top Alert Banner */}
        {globalStatus !== 'safe' && (
          <div style={{
            backgroundColor: globalStatus === 'critical' ? 'rgba(226, 76, 76, 0.08)' : 'rgba(224, 166, 60, 0.08)',
            border: `1px solid ${globalStatus === 'critical' ? 'var(--color-critical)' : 'var(--color-warning)'}`,
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 'var(--radius-card)'
          }}>
            <span style={{ 
              fontFamily: 'var(--font-title)', 
              fontWeight: '600', 
              fontSize: '11px',
              color: globalStatus === 'critical' ? 'var(--color-critical)' : 'var(--color-warning)',
              letterSpacing: '0.5px'
            }}>
              [SURVEILLANCE TRIPPED] SAFETY COMPLIANCE EXCEPTION REPORTED IN SEC_{isTrespass ? 'B' : isFall ? 'C' : isFire ? 'D' : 'A'}
            </span>
            <span className="mono" style={{ fontSize: '9px', opacity: 0.6 }}>IMMEDIATE REVIEW ENFORCED</span>
          </div>
        )}

        <div className="panel-header-scada">
          <span className="panel-title-scada">YOLO Neural Object Detection Matrix</span>
          <span className="mono" style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>STREAMS: 4 ONLINE</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          flex: 1,
          minHeight: 0
        }}>
          {/* Camera 1 */}
          <div className="panel" style={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            border: isHelmetOff ? '1px solid var(--color-warning)' : '1px solid var(--border-color)' 
          }}>
            <canvas ref={canvasRefs[0]} width={420} height={220} style={{ width: '100%', flex: 1, objectFit: 'contain' }} />
            <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)' }}>
              <span className="mono">RESOLVED_TRK: 01</span>
              <span className="mono">PPE_ERRORS: {isHelmetOff ? '01' : '00'}</span>
              <span className="mono">SECTOR_STATE: {isHelmetOff ? 'WARN' : 'NOMINAL'}</span>
            </div>
          </div>

          {/* Camera 2 */}
          <div className="panel" style={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            border: isTrespass ? '1px solid var(--color-critical)' : '1px solid var(--border-color)' 
          }}>
            <canvas ref={canvasRefs[1]} width={420} height={220} style={{ width: '100%', flex: 1, objectFit: 'contain' }} />
            <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)' }}>
              <span className="mono">RESOLVED_TRK: 01</span>
              <span className="mono">BREACHES: {isTrespass ? '01' : '00'}</span>
              <span className="mono">SECTOR_STATE: {isTrespass ? 'CRIT' : 'NOMINAL'}</span>
            </div>
          </div>

          {/* Camera 3 */}
          <div className="panel" style={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            border: isFall ? '1px solid var(--color-critical)' : '1px solid var(--border-color)' 
          }}>
            <canvas ref={canvasRefs[2]} width={420} height={220} style={{ width: '100%', flex: 1, objectFit: 'contain' }} />
            <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)' }}>
              <span className="mono">RESOLVED_TRK: 01</span>
              <span className="mono">ACCIDENTS: {isFall ? '01' : '00'}</span>
              <span className="mono">SECTOR_STATE: {isFall ? 'CRIT' : 'NOMINAL'}</span>
            </div>
          </div>

          {/* Camera 4 */}
          <div className="panel" style={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            border: isFire ? '1px solid var(--color-critical)' : '1px solid var(--border-color)' 
          }}>
            <canvas ref={canvasRefs[3]} width={420} height={220} style={{ width: '100%', flex: 1, objectFit: 'contain' }} />
            <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)' }}>
              <span className="mono">RESOLVED_TRK: 00</span>
              <span className="mono">THERMAL_FAULTS: {isFire ? '01' : '00'}</span>
              <span className="mono">SECTOR_STATE: {isFire ? 'CRIT' : 'NOMINAL'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Surveillance Logs Feed */}
      <div className="panel" style={{ height: '100%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
        <div className="panel-header-scada">
          <span className="panel-title-scada">Surveillance Logs Ticker</span>
          <span className="mono" style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>SYNC: LIVE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          {cameraLogs.map(log => (
            <div key={log.id} style={{
              padding: '10px',
              border: '1px solid var(--border-color)',
              borderLeft: `3px solid ${log.level === 'critical' ? 'var(--color-critical)' : log.level === 'warning' ? 'var(--color-warning)' : 'var(--color-safe)'}`,
              background: 'rgba(255, 255, 255, 0.005)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5px', color: 'var(--text-secondary)' }}>
                <span className="mono">{log.cam}</span>
                <span className="mono">{log.time}</span>
              </div>
              <div className="mono" style={{ 
                fontSize: '9.5px', 
                color: log.level === 'critical' ? 'var(--color-critical)' : log.level === 'warning' ? 'var(--color-warning)' : 'var(--text-primary)',
                lineHeight: '1.4'
              }}>
                {log.text}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Cameras;
