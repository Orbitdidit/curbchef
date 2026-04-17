import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const STEP_PROMPTS = {
  0: ["What makes a great truck name?", "What info do I need to get started?"],
  1: ["Does my location need to be exact?", "Can I change my location later?"],
  2: ["What photos work best?", "Do I need professional photos?"],
  3: ["How should I price my items?", "What items should I list first?", "How do I get in the $5 Specials carousel?"],
  4: ["When should I go live?", "What's the difference between Open and Opening Soon?"],
  5: ["Why does the kitchen photo matter?", "What should be in the photo?"],
  6: ["What happens after I submit?", "How do I set up payments?"],
};

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  if (message._loading) {
    return (
      <div className="flex gap-2 justify-start">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-sm"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}>🚚</div>
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: '#2e3638' }}>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: '#77ffc8', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-sm"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}>🚚</div>
      )}
      <div className={`max-w-[84%] px-4 py-2.5 text-sm leading-relaxed ${isUser ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'}`}
        style={isUser
          ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }
          : { background: '#2e3638', color: '#dff0e8' }
        }>
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="my-0.5">{children}</p>,
            strong: ({ children }) => <strong className="font-black">{children}</strong>,
            ul: ({ children }) => <ul className="ml-4 list-disc my-1">{children}</ul>,
            li: ({ children }) => <li className="my-0.5">{children}</li>,
          }}
        >{message.content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default function OnboardingGuideChat({ currentStep, vendorEmail }) {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => () => unsubRef.current?.(), []);
  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  // Reset conversation hint when step changes
  const stepPrompts = STEP_PROMPTS[currentStep] || [];

  const ensureConversation = async () => {
    if (conversation) return conversation;
    const convo = await base44.agents.createConversation({
      agent_name: 'onboarding_guide',
      metadata: { name: `Onboarding — ${vendorEmail || 'New Vendor'}` },
    });
    setConversation(convo);
    unsubRef.current?.();
    unsubRef.current = base44.agents.subscribeToConversation(convo.id, (data) => {
      const msgs = (data.messages || []).filter(m => m.role !== 'system');
      if (msgs.length) {
        setMessages(msgs);
        const allDone = !msgs.some(m =>
          m.tool_calls?.some(t => ['running', 'in_progress', 'pending'].includes(t.status))
        );
        const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant' && m.content);
        if (allDone && lastAssistant) setLoading(false);
      }
    });
    return convo;
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setOpen(true);
    setLoading(true);
    setMessages(prev => [
      ...prev,
      { role: 'user', content: msg },
      { role: 'assistant', _loading: true, content: '' },
    ]);
    const convo = await ensureConversation();
    const fullMsg = vendorEmail
      ? `${msg}\n\n(Vendor email: ${vendorEmail}, currently on onboarding step ${currentStep + 1})`
      : msg;
    await base44.agents.addMessage(convo, { role: 'user', content: fullMsg });
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(119,255,200,0.2)', background: '#151d1f' }}>
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3"
        style={{ background: open ? '#192123' : 'rgba(119,255,200,0.04)' }}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}>🚚</div>
        <div className="flex-1 text-left">
          <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>Launch Coach</p>
          <p className="text-[10px]" style={{ color: '#bacbc0' }}>Ask anything about this step</p>
        </div>
        <Sparkles className="w-3.5 h-3.5 mr-1" style={{ color: '#77ffc8' }} />
        {open ? <ChevronUp className="w-4 h-4" style={{ color: '#bacbc0' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#bacbc0' }} />}
      </button>

      {open && (
        <>
          {/* Quick prompts (only if no messages yet) */}
          {messages.length === 0 && stepPrompts.length > 0 && (
            <div className="px-4 pt-3 pb-2 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(59,74,66,0.2)' }}>
              {stepPrompts.map(p => (
                <button key={p} onClick={() => sendMessage(p)}
                  className="text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                  style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.3)' }}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="px-4 py-3 flex flex-col gap-3 max-h-64 overflow-y-auto no-scrollbar"
              style={{ borderTop: '1px solid rgba(59,74,66,0.2)' }}>
              {messages.filter(m => m.role !== 'system').map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-3 pt-2 flex gap-2" style={{ borderTop: messages.length ? '1px solid rgba(59,74,66,0.2)' : 'none' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask your launch coach..."
              className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.3)' }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
              style={input.trim() && !loading
                ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }
                : { background: '#2e3638' }
              }>
              <Send className="w-3.5 h-3.5" style={{ color: input.trim() && !loading ? '#003826' : '#bacbc0' }} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}