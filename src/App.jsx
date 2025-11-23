// App.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Lock, Search, Shield, Database } from 'lucide-react';
import './App.css';

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Welcome to the JFK Files Intelligence System. Ask me anything about the declassified assassination records.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false); // user has sent at least one message

  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);

  // Auto-scroll on new messages, but ONLY after user has interacted
  useEffect(() => {
    if (!hasInteracted) return; // do nothing on first load

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, hasInteracted]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const userInput = input;

    // Mark that the user has interacted at least once
    setHasInteracted(true);

    // Build the conversation including the new user message
    const newMessages = [...messages, userMessage];

    // Placeholder assistant message for streaming
    const placeholderAssistant = { role: 'assistant', content: '' };
    const assistantIndex = newMessages.length; // index where placeholder will be

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

      // Read the stream chunk-by-chunk
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;

          // Update the assistant message content incrementally
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
      // Overwrite placeholder with error message
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
    { label: 'Total Documents', value: '2500+', icon: FileText },
    { label: 'Pages Analyzed', value: '65,000+', icon: Database },
    { label: 'Declassified', value: '2025', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-black text-white w-full">
      {/* Hero Header with Background */}
      <div className="hero-header w-full">
        <div className="hero-pattern"></div>
        <div className="glow-orb-left"></div>
        <div className="glow-orb-right"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            <span className="text-xs sm:text-sm font-semibold text-red-400 uppercase tracking-wider">
              Declassified Intelligence System
            </span>
          </div>

          <h1 className="hero-title text-5xl sm:text-6xl md:text-7xl">
            J.F.K FILES
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-neutral-300">
            AI-Powered Document Analysis
          </h2>

          <p className="text-base sm:text-xl text-neutral-400 max-w-2xl mb-6 sm:mb-8 leading-relaxed">
            Explore 80,000+ pages of declassified documents from the JFK assassination investigation.
            Powered by advanced AI to help you uncover the truth.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl w-full">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-neutral-500 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
          <h3 className="text-xl sm:text-2xl font-bold">Ask the Intelligence System</h3>
        </div>

        {/* Chat Container */}
        <div className="chat-container">
          <div className="space-y-4 sm:space-y-6">
            {messages.map((msg, idx) => {
              const isLastMessage = idx === messages.length - 1;
              const showTypingDots =
                msg.role === 'assistant' &&
                msg.content === '' &&
                isLastMessage &&
                isStreaming;

              return (
                <div
                  key={idx}
                  className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={`message-bubble ${
                      msg.role === 'user' ? 'user-message' : 'ai-message'
                    } w-full sm:max-w-3xl`}
                  >
                    {/* <div className="text-xs text-neutral-500 mb-2 uppercase tracking-wide font-semibold">
                      {msg.role === 'user' ? 'Your Query' : 'AI Response'}
                    </div> */}
                    <div className="text-white leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
                      {showTypingDots ? (
                        <div className="flex gap-2">
                          <span className="typing-dot"></span>
                          <span
                            className="typing-dot"
                            style={{ animationDelay: '0.2s' }}
                          ></span>
                          <span
                            className="typing-dot"
                            style={{ animationDelay: '0.4s' }}
                          ></span>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {/* No timestamp */}
                  </div>
                </div>
              );
            })}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="What do you want to know about the JFK assassination?"
              className="chat-input w-full"
            />
            <button
              onClick={handleSend}
              className="send-button w-full sm:w-auto justify-center"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-neutral-600 text-xs sm:text-sm">
          <p>Powered by LangChain AI • Data from National Archives • Declassified March 2025</p>
        </div>
      </div>
    </div>
  );
}
