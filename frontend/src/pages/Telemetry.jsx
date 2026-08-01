import React, { useEffect, useState, useRef } from 'react';
import { useSafety } from '../context/SafetyContext';
import { fetchTelemetry } from '../services/api';

const Telemetry = () => {
  const { alerts } = useSafety();

  // Check if machine failure override is active
  const isMachineFailureActive = alerts.some(a => a.message.includes('SYS-HP-DRILL-04'));

  // Historical data states for live charts
  const [vibrationHistory, setVibrationHistory] = useState(Array(30).fill(1.8));
  const [temperatureHistory, setTemperatureHistory] = useState(Array(30).fill(41.0));
  const [pressureHistory, setPressureHistory] = useState(Array(30).fill(118.0));

  const [hasTelemetryError, setHasTelemetryError] = useState(false);

  // Canvas references
  const vibCanvasRef = useRef(null);
  const tempCanvasRef = useRef(null);
  const pressCanvasRef = useRef(null);

  // Live telemetry feed generator
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const data = await fetchTelemetry();
        setHasTelemetryError(false);

        setVibrationHistory(prev => {
          const nextVal = isMachineFailureActive 
            ? 8.0 + (Math.random() * 0.8) 
            : data.vibration;
          return [...prev.slice(1), nextVal];
        });

        setTemperatureHistory(prev => {
          const nextVal = isMachineFailureActive
            ? 92.5 + (Math.random() * 1.5)
            : data.temperature;
          return [...prev.slice(1), nextVal];
        });

        setPressureHistory(prev => {
          const nextVal = data.pressure;
          return [...prev.slice(1), nextVal];
        });
      } catch (e) {
        console.warn("Failed to fetch sensor telemetry:", e);
        setHasTelemetryError(true);
      }
    }, 800);

    return () => clearInterval(timer);
  }, [isMachineFailureActive]);

  // Redraw Canvas charts with threshold lines
  useEffect(() => {
    drawLiveChart(
      vibCanvasRef.current, 
      vibrationHistory, 
      0, 10, 'mm/s', 
      isMachineFailureActive ? 'var(--color-warning)' : '#a3a3a3',
      5.0, // Vibration limit threshold
      'var(--color-warning)'
    );
  }, [vibrationHistory, isMachineFailureActive]);

  useEffect(() => {
    drawLiveChart(
      tempCanvasRef.current, 
      temperatureHistory, 
      20, 100, '°C', 
      isMachineFailureActive ? 'var(--color-critical)' : '#a3a3a3',
      85.0, // Temperature limit threshold
      'var(--color-critical)'
    );
  }, [temperatureHistory, isMachineFailureActive]);

  useEffect(() => {
    drawLiveChart(
      pressCanvasRef.current, 
      pressureHistory, 
      80, 140, 'PSI', 
      '#a3a3a3',
      130.0, // Pressure limit threshold
      'var(--color-critical)'
    );
  }, [pressureHistory]);

  const drawLiveChart = (canvas, data, minVal, maxVal, unit, activeColor, thresholdVal, thresholdColor) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Dark background
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, w, h);

    // Draw horizontal grid lines
    ctx.strokeStyle = '#1e1e1e';
    ctx.lineWidth = 0.5;
    const gridCount = 4;
    for (let i = 1; i < gridCount; i++) {
      const gridY = (h / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(0, gridY);
      ctx.lineTo(w, gridY);
      ctx.stroke();
    }

    // Map data values to canvas coordinate points
    const points = data.map((val, idx) => {
      const x = (w / (data.length - 1)) * idx;
      const valRatio = (val - minVal) / (maxVal - minVal);
      const y = h - (valRatio * (h - 20)) - 10;
      return { x, y };
    });

    // Draw Area under curve gradient
    ctx.beginPath();
    ctx.moveTo(points[0].x, h);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, h);
    ctx.closePath();
    const areaGrad = ctx.createLinearGradient(0, 0, 0, h);
    areaGrad.addColorStop(0, `${activeColor}0c`);
    areaGrad.addColorStop(1, `${activeColor}00`);
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Draw Curve line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Dashed Limit Threshold Line
    if (thresholdVal !== undefined) {
      const thresholdRatio = (thresholdVal - minVal) / (maxVal - minVal);
      const thresholdY = h - (thresholdRatio * (h - 20)) - 10;

      ctx.strokeStyle = thresholdColor || 'var(--color-critical)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, thresholdY);
      ctx.lineTo(w, thresholdY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Limit Label text
      ctx.fillStyle = thresholdColor || 'var(--color-critical)';
      ctx.font = '500 7.5px var(--font-mono)';
      ctx.fillText(`THRESHOLD LIMIT: ${thresholdVal} ${unit}`, 10, thresholdY - 4);
    }

    // Draw real-time text parameter value in corner
    const latestVal = data[data.length - 1].toFixed(1);
    ctx.fillStyle = activeColor;
    ctx.font = '500 11px monospace';
    ctx.fillText(`${latestVal} ${unit}`, w - 75, 20);
  };

  return (
    <div className="panel" style={{ height: '100%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
      <div className="panel-header-scada">
        <span className="panel-title-scada">Telemetry Analytics // Real-time Sensor streams</span>
        <span className="mono" style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>RATE: 800ms</span>
      </div>

      {hasTelemetryError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.02)',
          border: '1px solid var(--color-critical)',
          padding: '8px 12px',
          color: 'var(--color-critical)',
          fontSize: '11px',
          fontFamily: 'var(--font-title)',
          fontWeight: '600',
          borderRadius: 'var(--radius-card)'
        }}>
          [WARN] TELEMETRY STREAM DISCONNECTED FROM INSTRUMENT NETWORK
        </div>
      )}

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div className="panel" style={{ padding: '14px 16px', borderLeft: isMachineFailureActive ? `3px solid var(--color-warning)` : '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-secondary)' }}>SYS-HP-DRILL-04 / VIBRATION</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
            <span className="mono" style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {vibrationHistory[vibrationHistory.length - 1].toFixed(2)} mm/s
            </span>
            {isMachineFailureActive && (
              <span className="mono" style={{ fontSize: '8px', fontWeight: '600', color: 'var(--color-warning)' }}>
                SPIKE_ALERT
              </span>
            )}
          </div>
        </div>

        <div className="panel" style={{ padding: '14px 16px', borderLeft: isMachineFailureActive ? `3px solid var(--color-critical)` : '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-secondary)' }}>SYS-HP-DRILL-04 / CORE_TEMP</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
            <span className="mono" style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {temperatureHistory[temperatureHistory.length - 1].toFixed(1)} °C
            </span>
            {isMachineFailureActive && (
              <span className="mono" style={{ fontSize: '8px', fontWeight: '600', color: 'var(--color-critical)' }}>
                OVERHEAT_ALERT
              </span>
            )}
          </div>
        </div>

        <div className="panel" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-secondary)' }}>CRANE-LOAD-02 / HYDRAULIC_PRESS</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
            <span className="mono" style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {pressureHistory[pressureHistory.length - 1].toFixed(1)} PSI
            </span>
            <span className="mono" style={{ fontSize: '8px', fontWeight: '600', color: 'var(--color-safe)' }}>NOMINAL</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Containers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        
        {/* Vibration Chart */}
        <div className="panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
            <span className="mono">VIB_LOG (SYS-HP-DRILL-04)</span>
            <span className="mono" style={{ marginLeft: 'auto' }}>LIMIT: 5.0 mm/s</span>
          </div>
          <canvas ref={vibCanvasRef} width={650} height={100} style={{ width: '100%', height: '80px', display: 'block', borderRadius: '4px' }} />
        </div>

        {/* Temperature Chart */}
        <div className="panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
            <span className="mono">TEMP_LOG (SYS-HP-DRILL-04)</span>
            <span className="mono" style={{ marginLeft: 'auto' }}>LIMIT: 85.0 °C</span>
          </div>
          <canvas ref={tempCanvasRef} width={650} height={100} style={{ width: '100%', height: '80px', display: 'block', borderRadius: '4px' }} />
        </div>

        {/* Pressure Chart */}
        <div className="panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
            <span className="mono">PRESS_LOG (CRANE-LOAD-02)</span>
            <span className="mono" style={{ marginLeft: 'auto' }}>LIMIT: 130.0 PSI</span>
          </div>
          <canvas ref={pressCanvasRef} width={650} height={100} style={{ width: '100%', height: '80px', display: 'block', borderRadius: '4px' }} />
        </div>

      </div>
    </div>
  );
};

export default Telemetry;
