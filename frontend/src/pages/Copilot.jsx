import React, { useState } from 'react';
import { sendCopilotQuery } from '../services/api';

const Copilot = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'copilot', 
      text: "AI-Factory-Safety-Copilot online. I have read-only access to all zone compliance registers, machine telemetry sensor logs, and incident records. How can I assist you?", 
      data: null 
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // High-fidelity progressive execution steps log
  const [execSteps, setExecSteps] = useState([]);

  const handleSend = async (textToSend) => {
    const prompt = textToSend || userInput;
    if (!prompt.trim()) return;

    // Append user message
    const userMsg = { id: Date.now(), sender: 'user', text: prompt, data: null };
    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    
    // Clear and start progressive execution logs
    setExecSteps(["> [INFO] Establishing link to Safety Edge Gateway..."]);
    setIsTyping(true);

    const stepTimers = [];
    
    stepTimers.push(setTimeout(() => {
      setExecSteps(prev => [...prev, "> [INFO] Connected. Querying telemetry database logs..."]);
    }, 450));
    
    stepTimers.push(setTimeout(() => {
      setExecSteps(prev => [...prev, "> [INFO] Invoking YOLOv8x semantic model parser..."]);
    }, 900));

    stepTimers.push(setTimeout(() => {
      setExecSteps(prev => [...prev, "> [INFO] Generating LLM inference summary report..."]);
    }, 1300));

    try {
      const response = await sendCopilotQuery(prompt);
      
      // Wait for execution logs to complete before pushing response
      await new Promise(resolve => setTimeout(resolve, 1800));

      const copilotMsg = {
        id: Date.now() + 1,
        sender: 'copilot',
        text: response.text,
        data: response.data
      };
      setMessages(prev => [...prev, copilotMsg]);
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 1800));
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'copilot',
        text: "Error communicating with Safety Assistant backend module.",
        data: null
      }]);
    } finally {
      stepTimers.forEach(t => clearTimeout(t));
      setIsTyping(false);
      setExecSteps([]);
    }
  };

  const suggestionChips = [
    "Show active violations",
    "Which machine is unsafe?",
    "Show incidents list"
  ];

  return (
    <div className="panel" style={{
      height: '100%',
      display: 'grid',
      gridTemplateColumns: '1.1fr 3.3fr',
      gap: '16px',
      padding: '16px',
      overflow: 'hidden',
      fontFamily: 'var(--font-main)'
    }}>
      
      {/* Left Chat Archive Column */}
      <div className="panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span className="mono" style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>CO-PILOT HISTORY LOG</span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          <div className="panel" style={{ padding: '10px', fontSize: '11px', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', borderLeft: '2px solid var(--border-color)' }}>
            <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>11:22:15</span>
            <div style={{ fontWeight: '500', color: 'var(--text-primary)', marginTop: '4px' }}>Query: Active Violations</div>
          </div>
          <div className="panel" style={{ padding: '10px', fontSize: '11px', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', borderLeft: '2px solid var(--border-color)' }}>
            <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>10:45:09</span>
            <div style={{ fontWeight: '500', color: 'var(--text-primary)', marginTop: '4px' }}>Query: Sector B Heat Index</div>
          </div>
        </div>
      </div>

      {/* Main Chat Console Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflow: 'hidden' }}>
        
        {/* Messages scroll box */}
        <div className="panel" style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: '#090b0d' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span className="mono" style={{
                fontSize: '8px',
                color: 'var(--text-muted)',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {msg.sender === 'user' ? 'SUPERVISOR' : 'SAFETY_AI'}
              </span>

              <div style={{
                padding: '12px 16px',
                background: msg.sender === 'user' ? 'rgba(255,255,255,0.03)' : 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                lineHeight: '1.6',
                borderRadius: '2px'
              }}>
                {msg.text}

                {/* Structured Rich Output Table */}
                {msg.data && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr>
                          {Object.keys(msg.data[0]).map(key => (
                            <th key={key} style={{ padding: '6px 8px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textTransform: 'uppercase', fontSize: '9px', fontWeight: '500' }}>
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.data.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {Object.values(row).map((val, cIdx) => (
                              <td key={cIdx} className="mono" style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Progressive execution steps log animation */}
          {isTyping && (
            <div style={{ 
              alignSelf: 'flex-start',
              padding: '12px 16px',
              background: 'rgba(224, 166, 60, 0.02)',
              border: '1px solid var(--border-color)',
              width: '80%',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span className="mono" style={{ fontSize: '8px', color: 'var(--color-warning)' }}>COPILOT_PROCESS_EXECUTION_LOG:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {execSteps.map((step, idx) => (
                  <div key={idx} className="mono" style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Chips */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="simulator-btn"
                style={{ margin: 0, padding: '5px 10px', fontSize: '10px', borderRadius: '15px' }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask Safety Copilot..."
              style={{
                flex: 1,
                background: '#090b0d',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '10px 14px',
                fontSize: '12px',
                borderRadius: 'var(--radius-btn)',
                outline: 'none',
                fontFamily: 'var(--font-main)'
              }}
            />
            <button
              onClick={() => handleSend()}
              className="simulator-reset-btn"
              style={{ margin: 0, padding: '10px 20px' }}
            >
              Send
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Copilot;
