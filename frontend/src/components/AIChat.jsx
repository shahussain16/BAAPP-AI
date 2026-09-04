import React, { useState } from 'react';
import { Send, Bot, User, Code, Sparkles, AlertCircle, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

const COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#e11d48', '#0891b2'];

export default function AIChat({ cleanedData }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your **BAAPP-AI Business Assistant**. Ask me plain-English questions about your sales, products, expenses, or peak days!",
      chart: null,
      code: null
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCodeIdx, setShowCodeIdx] = useState(null);

  const suggestedQuestions = [
    "Should I add new products or offerings?",
    "What is my top-performing item?",
    "What should I stop selling or offering?",
    "How can I improve overall business profit?",
    "Where should I open my next branch location?",
    "Are weekend sales higher than weekdays?"
  ];

  const handleSend = async (questionText) => {
    const q = questionText || inputQuery;
    if (!q || !q.trim()) return;

    // Append User Message
    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          cleaned_data: cleanedData || []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get answer from AI Assistant');
      }

      const data = await response.json();
      const aiMsg = {
        sender: 'ai',
        text: data.explanation || "Analyzed your dataset successfully.",
        chart: data.chart_config,
        code: data.executed_code
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "Sorry, I couldn't compute that answer right now. Make sure your dataset is loaded!",
          chart: null,
          code: null
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-box" style={{ display: 'flex', flexDirection: 'column', height: '620px', padding: '1.5rem', margin: 0 }}>
      {/* Chat Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', padding: '0.6rem', borderRadius: '12px' }}>
          <Bot size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Ask BAAPP-AI Analyst</h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            Executes sandboxed pandas code on your uploaded dataset — zero hallucinated answers!
          </p>
        </div>
      </div>

      {/* Suggested Questions Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.85rem 0', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Sparkles size={14} color="#2563eb" /> Suggested:
        </span>
        {suggestedQuestions.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            disabled={isLoading}
            style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              borderRadius: '20px',
              padding: '0.3rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            {msg.sender === 'ai' && (
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={18} />
              </div>
            )}

            <div
              style={{
                background: msg.sender === 'user' ? '#2563eb' : '#f8fafc',
                color: msg.sender === 'user' ? 'white' : '#0f172a',
                padding: '0.9rem 1.1rem',
                borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                fontSize: '0.92rem',
                lineHeight: 1.5
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />

              {/* Render Embedded Recharts Chart if present */}
              {msg.chart && msg.chart.data && msg.chart.data.length > 0 && (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', marginTop: '0.85rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BarChart2 size={16} color="#2563eb" />
                    {msg.chart.title || 'Analysis Chart'}
                  </div>
                  <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                      <BarChart data={msg.chart.data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey={msg.chart.xKey} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey={msg.chart.yKey} fill="#2563eb" radius={[4, 4, 0, 0]}>
                          {msg.chart.data.map((entry, idx) => (
                            <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Toggle Pandas Executed Code */}
              {msg.code && (
                <div style={{ marginTop: '0.6rem' }}>
                  <button
                    onClick={() => setShowCodeIdx(showCodeIdx === index ? null : index)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: 0 }}
                  >
                    <Code size={13} />
                    {showCodeIdx === index ? 'Hide Python pandas code' : 'View Python pandas code executed'}
                  </button>
                  {showCodeIdx === index && (
                    <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '0.65rem', borderRadius: '6px', fontSize: '0.78rem', marginTop: '0.4rem', overflowX: 'auto' }}>
                      <code>{msg.code}</code>
                    </pre>
                  )}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={18} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} />
            </div>
            <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.88rem', color: '#64748b' }}>
              Running sandboxed pandas math...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Ask any question about your sales, products, expenses..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="btn-primary" disabled={isLoading || !inputQuery.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

// Simple markdown formatter helper for **bold** text
function formatMarkdown(text) {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
