import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Sparkles, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const STARTER_PROMPTS = [
  "How close am I to VIP? 🏆",
  "What should I order to level up fast? 🚀",
  "What perks do I unlock next? 🎁",
];

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isLoading = message._loading;

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-sm"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}>
          🏅
        </div>
      )}
      <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
        style={isUser
          ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }
          : { background: '#2e3638', color: '#dff0e8' }
        }>
        {isLoading ? (
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: '#77ffc8', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="my-0.5">{children}</p>,
              strong: ({ children }) => <strong className="font-black">{children}</strong>,
              ul: ({ children }) => <ul className="ml-4 list-disc my-1">{children}</ul>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function RewardsCoach({ user, reward }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => () => unsubRef.current?.(), []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startConversation = async (firstMessage) => {
    setStarted(true);
    setLoading(true);
    setMessages([
      { role: 'user', content: firstMessage },
      { role: 'assistant', _loading: true, content: '' },
    ]);

    const convo = await base44.agents.createConversation({
      agent_name: 'rewards_coach',
      metadata: { name: `Rewards Coach — ${user?.full_name || 'Guest'}` },
    });
    setConversation(convo);

    unsubRef.current = base44.agents.subscribeToConversation(convo.id, (data) => {
      const msgs = (data.messages || []).filter(m => m.role !== 'system');
      setMessages(msgs.length ? msgs : [
        { role: 'user', content: firstMessage },
        { role: 'assistant', _loading: true, content: '' },
      ]);
      const allDone = !msgs.some(m =>
        m.tool_calls?.some(t => ['running', 'in_progress', 'pending'].includes(t.status))
      );
      const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant' && m.content);
      if (allDone && lastAssistant) setLoading(false);
    });

    const userEmail = user?.email || 'unknown';
    await base44.agents.addMessage(convo, {
      role: 'user',
      content: `${firstMessage}\n\n(My email: ${userEmail})`,
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    setLoading(true);

    if (!conversation) {
      startConversation(text);
      return;
    }

    setMessages(prev => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', _loading: true, content: '' },
    ]);
    await base44.agents.addMessage(conversation, { role: 'user', content: text });
  };

  // Tier progress bar
  const tierThresholds = { starter: 0, regular: 500, vip: 1000, legend: 2500 };
  const nextTier = { starter: 'regular', regular: 'vip', vip: 'legend', legend: null };
  const currentTier = reward?.tier || 'starter';
  const points = reward?.points || 0;
  const nextTierName = nextTier[currentTier];
  const nextThreshold = nextTierName ? tierThresholds[nextTierName] : tierThresholds['legend'];
  const prevThreshold = tierThresholds[currentTier];
  const progress = nextTierName
    ? Math.min(100, ((points - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
    : 100;

  if (!started) {
    return (
      <div className="rounded-3xl overflow-hidden" style={{ background: '#151d1f', border: '1px solid rgba(119,255,200,0.15)' }}>
        {/* Header */}
        <div className="px-5 pt-5 pb-4" style={{ background: 'linear-gradient(135deg,rgba(119,255,200,0.06),rgba(119,255,200,0.02))' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}>🏅</div>
            <div>
              <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>Rewards Coach</p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>AI-powered perk advisor · Level up faster</p>
            </div>
          </div>

          {/* Points + progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#77ffc8' }}>
                {currentTier}
              </span>
              {nextTierName && (
                <span className="text-[10px] font-semibold" style={{ color: '#bacbc0' }}>
                  {nextThreshold - points} pts to {nextTierName}
                </span>
              )}
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(186,203,192,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#77ffc8,#00e6a7)', boxShadow: '0 0 8px rgba(119,255,200,0.4)' }} />
            </div>
            <p className="text-xs mt-1.5 font-black" style={{ color: '#dff0e8' }}>{points.toLocaleString()} pts</p>
          </div>
        </div>

        {/* Quick prompts */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#bacbc0' }}>ASK YOUR COACH</p>
          <div className="flex flex-col gap-2">
            {STARTER_PROMPTS.map(p => (
              <button key={p} onClick={() => startConversation(p)}
                className="text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.3)' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden flex flex-col" style={{ background: '#151d1f', border: '1px solid rgba(119,255,200,0.15)', height: '420px' }}>
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ background: '#192123', borderBottom: '1px solid rgba(59,74,66,0.2)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}>🏅</div>
        <p className="font-heading font-black text-sm flex-1" style={{ color: '#dff0e8' }}>Rewards Coach</p>
        <button onClick={() => { setStarted(false); setMessages([]); setConversation(null); }}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: '#2e3638' }}>
          <X className="w-3.5 h-3.5" style={{ color: '#bacbc0' }} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 no-scrollbar">
        {messages.filter(m => m.role !== 'system').map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(59,74,66,0.2)' }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your rewards..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.3)' }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={input.trim() && !loading
              ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }
              : { background: '#2e3638' }
            }>
            <Send className="w-4 h-4" style={{ color: input.trim() && !loading ? '#003826' : '#bacbc0' }} />
          </button>
        </div>
      </div>
    </div>
  );
}