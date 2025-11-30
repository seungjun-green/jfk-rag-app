import React, { useState, useRef, useEffect } from 'react';
import { FileText, Lock, Search, Shield, Database, ChevronRight, Activity, Terminal } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: ' Identity verified. \n\nWelcome to the JFK Files Intelligence System. Access level: DECLASSIFIED. \n\nI have parsed 65,000+ pages of records. You may query specific events, witnesses, or the Warren Commission discrepancies.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Refs for scrolling
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (hasInteracted) {
      scrollToBottom();
    }
  }, [messages, isStreaming, hasInteracted]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    
    // Mark interaction
    setHasInteracted(true);

    // Build conversation
    const newMessages = [...messages, userMessage];

    // Placeholder assistant message
    const placeholderAssistant = { role: 'assistant', content: '' };
    const assistantIndex = newMessages.length; 

    setMessages([...newMessages, placeholderAssistant]);
    setInput('');
    setIsStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let assistantText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;

          setMessages((prev) => {
            const updated = [...prev];
            if (updated[assistantIndex]) {
              updated[assistantIndex] = {
                ...updated[assistantIndex],
                content: assistantText,
              };
            }
            return updated;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[assistantIndex]) {
          updated[assistantIndex] = {
            role: 'assistant',
            content: 'There was an error talking to the server.',
          };
        } else {
          updated.push({
            role: 'assistant',
            content: 'There was an error talking to the server.',
          });
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const stats = [
    { label: 'Documents', value: '2,500+', icon: FileText },
    { label: 'Pages', value: '65k', icon: Database },
    { label: 'Status', value: 'OPEN', icon: Lock },
  ];

  return (
    <div className="app-container">
      <style>{`
        :root {
          --bg-dark: #09090b;
          --bg-panel: #18181b;
          --bg-panel-light: #27272a;
          --text-main: #f4f4f5;
          --text-muted: #71717a;
          --accent-red: #ef4444;
          --accent-red-dim: rgba(239, 68, 68, 0.1);
          --border-color: rgba(255, 255, 255, 0.08);
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .app-container {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          background-color: var(--bg-dark);
          color: var(--text-main);
          overflow: hidden;
        }

        /* --- Background Effects --- */
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          pointer-events: none;
          z-index: 0;
        }
        
        .bg-glow {
          position: absolute;
          top: -20%;
          left: -10%;
          width: 50%;
          height: 50%;
          background: rgba(127, 29, 29, 0.15);
          filter: blur(120px);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        /* --- Header --- */
        header {
          position: relative;
          z-index: 20;
          height: 60px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(9, 9, 11, 0.8);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          padding: 0 1rem;
        }

        .header-content {
          max-width: 1024px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: var(--accent-red-dim);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-red);
        }

        .logo-text h1 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 2px;
          font-family: monospace;
        }

        .status-badge {
          font-size: 10px;
          color: #f87171;
          font-family: monospace;
          letter-spacing: 1px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background-color: var(--accent-red);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }

        /* --- Main Content --- */
        main {
          flex: 1;
          position: relative;
          z-index: 10;
          overflow-y: auto;
          overflow-x: hidden;
          padding-bottom: 140px; /* Space for sticky footer */
        }

        .content-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 2.5rem 1rem;
          width: 100%;
        }

        /* --- Stats Hero --- */
        .stats-hero {
          margin-bottom: 3rem;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: rgba(24, 24, 27, 0.4);
          border: 1px solid var(--border-color);
          backdrop-filter: blur(4px);
          border-radius: 16px;
          padding: 1rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 8px;
        }

        .stat-icon-wrapper {
          background: var(--accent-red-dim);
          padding: 8px;
          border-radius: 50%;
          margin-bottom: 8px;
          color: var(--accent-red);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-label {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-family: monospace;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
          font-family: monospace;
          color: white;
        }

        /* --- Chat Messages --- */
        .chat-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .message-row {
          display: flex;
          width: 100%;
          animation: slideUp 0.3s ease-out forwards;
        }

        .message-row.user {
          justify-content: flex-end;
        }

        .message-row.assistant {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 85%;
          padding: 16px 24px;
          border-radius: 16px;
          font-size: 15px;
          line-height: 1.6;
          position: relative;
        }

        .assistant .message-bubble {
          background: rgba(24, 24, 27, 0.6);
          border: 1px solid var(--border-color);
          color: #e4e4e7;
          border-top-left-radius: 2px;
        }

        .user .message-bubble {
          background: #27272a;
          color: white;
          border-top-right-radius: 2px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .role-label {
          font-size: 10px;
          font-family: monospace;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .assistant .role-label { color: #f87171; }
        .user .role-label { color: #a1a1aa; }

        .typing-dots {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: 6px;
        }

        .dot {
          width: 4px;
          height: 4px;
          background: var(--accent-red);
          border-radius: 50%;
          animation: bounce 1s infinite;
        }

        .dot:nth-child(2) { animation-delay: 0.1s; }
        .dot:nth-child(3) { animation-delay: 0.2s; }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- Input Area --- */
        .input-area {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 30;
          padding: 16px 16px 32px 16px;
          background: linear-gradient(to top, var(--bg-dark) 80%, transparent);
        }

        .input-wrapper {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 6px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
          transition: border-color 0.2s;
        }

        .search-box:focus-within {
          border-color: rgba(255,255,255,0.2);
        }

        .search-icon {
          padding: 0 12px;
          color: var(--text-muted);
        }

        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 12px 0;
          font-size: 16px;
          outline: none;
        }

        .chat-input::placeholder {
          color: #52525b;
        }

        .send-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-family: monospace;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.2s;
        }

        .send-btn.active {
          background: #f4f4f5;
          color: black;
        }

        .send-btn.active:hover {
          transform: scale(1.02);
        }

        .send-btn.disabled {
          background: #27272a;
          color: #52525b;
          cursor: not-allowed;
        }

        .footer-text {
          text-align: center;
          margin-top: 12px;
          font-size: 10px;
          color: #52525b;
          font-family: monospace;
        }

        /* --- Scrollbar --- */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }

        /* --- Mobile Tweaks --- */
        @media (max-width: 640px) {
          .stats-hero { gap: 4px; padding: 12px; }
          .stat-value { font-size: 16px; }
          .message-bubble { max-width: 90%; font-size: 14px; padding: 12px 16px; }
        }
      `}</style>

      {/* --- Visual Effects --- */}
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>

      {/* --- Header --- */}
      <header>
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <Shield size={16} />
            </div>
            <div className="logo-text">
              <h1>JFK FILES</h1>
              <div className="status-badge">
                <span className="pulse-dot"></span>
                Live Connection
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main ref={scrollContainerRef}>
        <div className="content-wrapper">
          
          {/* Stats Header */}
          <div className="stats-hero">
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-icon-wrapper">
                  <s.icon size={16} />
                </div>
                <span className="stat-label">{s.label}</span>
                <span className="stat-value">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Chat List */}
          <div className="chat-list">
            {messages.map((msg, idx) => {
              const isAI = msg.role === 'assistant';
              return (
                <div key={idx} className={`message-row ${isAI ? 'assistant' : 'user'}`}>
                  <div className="message-bubble">
                    <div className="role-label">
                      {isAI ? <Terminal size={12} /> : <Activity size={12} />}
                      {isAI ? 'System Intelligence' : 'User Query'}
                    </div>
                    
                    <div className="message-text">
                      {msg.content}
                      {isAI && msg.content === '' && isStreaming && (
                        <span className="typing-dots">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} style={{ height: '1px' }} />
          </div>

        </div>
      </main>

      {/* --- Footer Input --- */}
      <div className="input-area">
        <div className="input-wrapper">
          
          <div className="search-box">
            <div className="search-icon">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query the database..."
              className="chat-input"
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className={`send-btn ${input.trim() && !isStreaming ? 'active' : 'disabled'}`}
            >
              <span>SEND</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="footer-text">
            ● CONFIDENTIAL // NOFORN
          </div>
        </div>
      </div>
    </div>
  );
}