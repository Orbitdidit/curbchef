import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ChevronLeft, Send, Flame } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const STARTER_PROMPTS = [
  "🌮 I'm craving tacos under $10",
  "🌶️ Hit me with your spiciest item",
  "🥗 Something healthy and light",
  "🔥 What's hot and trending today?",
];

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  if (!message.content && !message.tool_calls?.length) return null;

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-base"
          style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))' }}>
          🍽️
        </div>
      )}
      <div className={`max-w-[82%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {message.content && (
          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed`}
            style={isUser
              ? { background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)' }
              : { background: 'var(--cc-bg-2)', color: 'var(--cc-ink)', border: '1px solid rgba(var(--cc-line-rgb),0.3)' }
            }>
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <ReactMarkdown
                className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  p: ({ children }) => <p className="my-1" style={{ color: 'var(--cc-ink)' }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ color: 'var(--cc-accent)' }}>{children}</strong>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc" style={{ color: 'var(--cc-ink)' }}>{children}</ul>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {message.tool_calls?.some(t => t.status === 'running' || t.status === 'in_progress') && (
          <div className="flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-xs"
            style={{ background: 'var(--cc-bg-2)', color: 'var(--cc-ink-dim)' }}>
            <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--cc-accent) transparent transparent transparent' }} />
            Searching menu...
          </div>
        )}
      </div>
    </div>
  );
}

export default function FoodConcierge() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
    initConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    const convo = await base44.agents.createConversation({
      agent_name: 'food_recommender',
      metadata: { name: 'Food Recommendation' },
    });
    setConversation(convo);

    const unsub = base44.agents.subscribeToConversation(convo.id, (data) => {
      setMessages(data.messages || []);
      setSending(false);
    });

    // Kick off with a greeting
    await base44.agents.addMessage(convo, {
      role: 'user',
      content: "Hi! What's good today?",
    });
    setSending(true);

    return () => unsub();
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !conversation || sending) return;
    setInput('');
    setSending(true);
    await base44.agents.addMessage(conversation, { role: 'user', content: text });
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cc-bg-0)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 flex-shrink-0"
        style={{ background: 'var(--cc-bg-1)', borderBottom: '1px solid rgba(var(--cc-line-rgb),0.2)' }}>
        <Link to="/" className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--cc-bg-2)' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: 'var(--cc-ink)' }} />
        </Link>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
          style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))' }}>
          🍽️
        </div>
        <div className="flex-1">
          <p className="font-heading font-black text-sm" style={{ color: 'var(--cc-ink)' }}>Food Concierge</p>
          <p className="text-xs" style={{ color: 'var(--cc-accent)' }}>● AI-powered · Always hungry</p>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(var(--cc-warm-rgb),0.12)', border: '1px solid rgba(var(--cc-warm-rgb),0.25)' }}>
          <Flame className="w-3 h-3" style={{ color: 'var(--cc-warm)' }} />
          <span className="text-[10px] font-black" style={{ color: 'var(--cc-warm)' }}>LIVE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4"
        style={{ paddingBottom: '160px' }}>
        {messages.length === 0 && (
          <div className="text-center pt-8">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-heading font-black text-lg mb-1" style={{ color: 'var(--cc-ink)' }}>
              What are you craving?
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--cc-ink-dim)' }}>
              I'll find the best food truck bites near you
            </p>
            <div className="flex flex-col gap-2">
              {STARTER_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)}
                  className="px-4 py-3 rounded-2xl text-sm font-semibold text-left transition-all active:scale-95"
                  style={{ background: 'var(--cc-bg-2)', color: 'var(--cc-ink)', border: '1px solid rgba(var(--cc-line-rgb),0.3)' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.filter(m => m.role !== 'system').map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {sending && messages.length > 0 && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))' }}>🍽️</div>
            <div className="px-4 py-3 rounded-2xl flex items-center gap-2"
              style={{ background: 'var(--cc-bg-2)', border: '1px solid rgba(var(--cc-line-rgb),0.3)' }}>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: 'var(--cc-accent)', animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3"
        style={{ background: 'rgba(13,21,23,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(var(--cc-line-rgb),0.2)' }}>
        {/* Quick prompts */}
        {messages.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
            {['🌮 Tacos', '🔥 Spicy', '💵 Under $8', '🥗 Healthy', '🍔 Burgers'].map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'var(--cc-bg-2)', color: 'var(--cc-ink-dim)', border: '1px solid rgba(var(--cc-line-rgb),0.3)' }}>
                {p}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tell me what you're craving..."
            rows={1}
            className="flex-1 rounded-2xl px-4 py-3 text-sm outline-none resize-none"
            style={{ background: 'var(--cc-bg-2)', color: 'var(--cc-ink)', border: '1px solid rgba(var(--cc-line-rgb),0.4)', maxHeight: 120 }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={input.trim() && !sending
              ? { background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', boxShadow: '0 0 14px rgba(var(--cc-accent-rgb),0.35)' }
              : { background: 'var(--cc-bg-2)', opacity: 0.4 }
            }>
            <Send className="w-4 h-4" style={{ color: input.trim() && !sending ? 'var(--cc-accent-deep)' : 'var(--cc-ink-dim)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}