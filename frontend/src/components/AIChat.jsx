import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AIChat({ cleanedData }) {
  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 **Hello! I am your AI Business Assistant powered by Google Gemini.**\n\nI can analyze your uploaded sales data and give you instant advice on menu optimization, sales trends, staffing, or growth ideas. Ask me anything!",
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    "What is my top-performing item?",
    "Should I add new products to my store?",
    "What should I stop selling?",
    "How can I improve my profit margins?",
    "Where should I open my next branch?",
    "Are weekend sales higher than weekdays?"
  ];

  const handleSend = async (questionText) => {
    const query = questionText || inputQuestion;
    if (!query.trim()) return;

    if (!cleanedData || cleanedData.length === 0) {
      alert('Please upload or enter data first before asking the AI Assistant!');
      return;
    }

    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v2/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cleaned_data: cleanedData,
          question: query
        })
      });

      if (!response.ok) throw new Error('AI Assistant query failed');

      const result = await response.json();
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: result.explanation
        }
      ]);
    } catch (err) {
      console.error('Chat Error:', err);
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: " Sorry, I ran into a network issue: " + err.message
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-box" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', height: '650px', background: 'rgba(255, 255, 255, 0.95)' }}>
      
      {/* Clean Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)', color: 'white', padding: '0.65rem', borderRadius: '14px', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' }}>
            <Bot size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              AI Business Assistant
              <span className="badge-tag" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', color: '#059669', border: '1px solid #a7f3d0' }}>
                Powered by Google Gemini
              </span>
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
              Ask any business question in plain English about your spreadsheet data
            </p>
          </div>
        </div>
      </div>

      {/* Preset Question Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="btn-sample"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', background: '#f8fafc', margin: 0, borderRadius: '20px' }}
          >
            💡 {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1rem' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '0.75rem',
              justify: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.sender === 'ai' && (
              <div style={{ width: 36, height: 36, borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)' }}>
                <Bot size={20} />
              </div>
            )}

            <div className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              <div style={{ whiteSpace: 'pre-line', fontSize: '0.92rem', lineHeight: 1.6 }}>
                {msg.text}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div style={{ width: 36, height: 36, borderRadius: '12px', background: '#334155', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={20} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} />
            </div>
            <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#64748b' }}>
              <Sparkles size={16} color="#6366f1" className="animate-spin" />
              Thinking & analyzing your data with Google Gemini...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          placeholder="Ask any question about your data (e.g. 'why were sales low last Saturday?')..."
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '0.85rem 1.25rem',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            fontSize: '0.92rem',
            fontFamily: 'inherit',
            outline: 'none',
            background: '#f8fafc'
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputQuestion.trim()}
          className="btn-primary"
          style={{ padding: '0.85rem 1.4rem' }}
        >
          <Send size={18} />
          Ask Assistant
        </button>
      </div>
    </div>
  );
}
