import React, { useState, useRef } from 'react';
import { Send, Bot, User, Sparkles, Volume2, VolumeX, Copy, Check, BarChart2, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart as ReLineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AIChat({ cleanedData }) {
  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 **Hello! I am your AI Business Assistant powered by Google Gemini.**\n\nI can analyze your uploaded sales data and give you instant advice on menu optimization, sales trends, staffing, or growth ideas. Ask me anything!",
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [chartMode, setChartMode] = useState({}); // idx -> 'bar' | 'line' | 'area'
  const chatEndRef = useRef(null);

  const suggestedQuestions = [
    { label: "🏆 Top Sellers", query: "What is my top-performing item?" },
    { label: "📉 Discontinue List", query: "What should I stop selling?" },
    { label: "🚀 Profit Strategy", query: "How can I improve my profit margins?" },
    { label: "📅 Weekend Sales", query: "Are weekend sales higher than weekdays?" },
    { label: "➕ Product Expansion", query: "Should I add new products to my store?" }
  ];

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

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
    scrollToBottom();

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
      const updated = [
        ...newMessages,
        {
          sender: 'ai',
          text: result.explanation,
          chartConfig: result.chart_config,
          engineMode: result.engine_mode || 'Google Gemini Flash API'
        }
      ];
      setMessages(updated);
      scrollToBottom();
    } catch (err) {
      console.error('Chat Error:', err);
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: "Sorry, I ran into a network issue: " + err.message
        }
      ]);
      scrollToBottom();
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextToSpeech = (text, idx) => {
    if ('speechSynthesis' in window) {
      if (speakingIdx === idx) {
        window.speechSynthesis.cancel();
        setSpeakingIdx(null);
      } else {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*_#`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setSpeakingIdx(null);
        utterance.onerror = () => setSpeakingIdx(null);
        setSpeakingIdx(idx);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert('Speech synthesis is not supported in your browser.');
    }
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const handleExportResponse = (msg, idx) => {
    const content = `BAAPP AI Business Advice:\n\n${msg.text}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baapp_ai_advice_${idx}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleChartType = (idx, type) => {
    setChartMode(prev => ({ ...prev, [idx]: type }));
  };

  const renderChart = (chartConfig, idx) => {
    if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) return null;
    const mode = chartMode[idx] || 'bar';
    const data = chartConfig.data;
    const xKey = chartConfig.xKey;
    const yKey = chartConfig.yKey;

    return (
      <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BarChart2 size={16} color="#6366f1" />
            {chartConfig.title || 'Data Analytics Visualizer'}
          </div>
          {/* View mode toggle pills */}
          <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
            <button
              onClick={() => toggleChartType(idx, 'bar')}
              style={{
                fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: mode === 'bar' ? '#6366f1' : 'transparent', color: mode === 'bar' ? 'white' : '#64748b'
              }}
            >
              Bar
            </button>
            <button
              onClick={() => toggleChartType(idx, 'line')}
              style={{
                fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: mode === 'line' ? '#6366f1' : 'transparent', color: mode === 'line' ? 'white' : '#64748b'
              }}
            >
              Line
            </button>
            <button
              onClick={() => toggleChartType(idx, 'area')}
              style={{
                fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: mode === 'area' ? '#6366f1' : 'transparent', color: mode === 'area' ? 'white' : '#64748b'
              }}
            >
              Area
            </button>
          </div>
        </div>

        <div style={{ width: '100%', height: 210, background: '#f8fafc', borderRadius: '12px', padding: '0.65rem', border: '1px solid #e2e8f0' }}>
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'bar' && (
              <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey={yKey} fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
            {mode === 'line' && (
              <ReLineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey={yKey} stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
              </ReLineChart>
            )}
            {mode === 'area' && (
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey={yKey} fill="#c084fc" stroke="#8b5cf6" fillOpacity={0.4} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="card-box glass-container" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', height: '700px', background: 'rgba(255, 255, 255, 0.96)', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
      
      {/* Executive Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)', color: 'white', padding: '0.75rem', borderRadius: '16px', boxShadow: '0 6px 18px rgba(99, 102, 241, 0.35)' }}>
            <Bot size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              BAAPP AI Business Consultant
              <span className="badge-tag" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', color: '#059669', border: '1px solid #a7f3d0', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                ✨ Powered by Google Gemini
              </span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
              Ask any plain English business question about your spreadsheet data
            </p>
          </div>
        </div>
      </div>

      {/* Categorized Question Chips */}
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q.query)}
            disabled={isLoading}
            className="chip-btn"
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.4rem 0.85rem',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.35rem', marginBottom: '1rem' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '0.85rem',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.sender === 'ai' && (
              <div style={{ width: 38, height: 38, borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                <Bot size={21} />
              </div>
            )}

            <div className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ maxWidth: '85%', position: 'relative' }}>
              
              {/* Message Header bar for AI */}
              {msg.sender === 'ai' && idx > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', tracking: '0.05em' }}>
                    🤖 {msg.engineMode || 'AI Consultant Insight'}
                  </span>
                  
                  {/* Action Toolbar */}
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => handleTextToSpeech(msg.text, idx)}
                      title="Listen to advice"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: speakingIdx === idx ? '#ef4444' : '#64748b', padding: '2px 4px', borderRadius: '4px' }}
                    >
                      {speakingIdx === idx ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                    <button
                      onClick={() => handleCopyText(msg.text, idx)}
                      title="Copy text"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copiedIdx === idx ? '#10b981' : '#64748b', padding: '2px 4px', borderRadius: '4px' }}
                    >
                      {copiedIdx === idx ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                    <button
                      onClick={() => handleExportResponse(msg, idx)}
                      title="Export response"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px 4px', borderRadius: '4px' }}
                    >
                      <Download size={15} />
                    </button>
                  </div>
                </div>
              )}

              <div style={{ whiteSpace: 'pre-line', fontSize: '0.93rem', lineHeight: 1.65 }}>
                {msg.text}
              </div>

              {msg.chartConfig && renderChart(msg.chartConfig, idx)}
            </div>

            {msg.sender === 'user' && (
              <div style={{ width: 38, height: 38, borderRadius: '14px', background: '#1e293b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                <User size={21} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <div style={{ width: 38, height: 38, borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={21} />
            </div>
            <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              <Sparkles size={18} color="#6366f1" className="animate-spin" />
              Thinking & evaluating dataset metrics with Google Gemini...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          placeholder="Ask any business question (e.g. 'What should I stop selling?' or 'Are weekend sales higher?')..."
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '0.9rem 1.35rem',
            border: '1.5px solid #cbd5e1',
            borderRadius: '14px',
            fontSize: '0.93rem',
            fontFamily: 'inherit',
            outline: 'none',
            background: '#f8fafc',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputQuestion.trim()}
          className="btn-primary"
          style={{
            padding: '0.9rem 1.6rem',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Send size={18} />
          Ask Assistant
        </button>
      </div>
    </div>
  );
}
