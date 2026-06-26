import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, Loader2 } from 'lucide-react';

const STEP_CONTEXT = {
  1: 'The vendor is on Step 1: Basics — entering their truck name, cuisine type, description, and contact info.',
  2: 'The vendor is on Step 2: Photos — uploading a logo, truck photo, and food images.',
  3: 'The vendor is on Step 3: Location & Hours — setting their address, city, and operating hours.',
  4: 'The vendor is on Step 4: Menu — adding menu items with names, prices, and categories.',
  5: 'The vendor is on Step 5: Get Paid — connecting their Stripe account for payments.',
  6: 'The vendor is on Step 6: Extras — learning about optional features like Curb Drops and Live Streaming.',
  7: 'The vendor is on Step 7: Review — reviewing their profile and launching their truck.',
};

export default function OnboardingAssistantPanel({ truck, currentStep, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hey! I'm your CurbChef setup guide 🚚\n\n${STEP_CONTEXT[currentStep] || ''}\n\nWhat can I help you with?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    const context = `You are a friendly onboarding guide for CurbChef, a Houston food truck platform. ${STEP_CONTEXT[currentStep] || ''} Truck name: ${truck?.name || 'unknown'}. Keep answers short and helpful.`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `${context}\n\nVendor question: ${text}`,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: typeof res === 'string' ? res : (res.result || JSON.stringify(res)) }]);
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl flex flex-col"
        style={{ background: '#151d1f', border: '1px solid rgba(119,255,200,0.2)', maxHeight: '75vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(59,74,66,0.3)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-base"
              style={{ background: 'rgba(119,255,200,0.1)', border: '1px solid rgba(119,255,200,0.25)' }}>🚚</div>
            <div>
              <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>Setup Guide</p>
              <p className="text-[10px]" style={{ color: '#77ffc8' }}>Step {currentStep} — AI Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#1e2a2c' }}>
            <X className="w-4 h-4" style={{ color: '#bacbc0' }} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={m.role === 'user'
                  ? { background: 'rgba(119,255,200,0.12)', color: '#dff0e8', border: '1px solid rgba(119,255,200,0.2)' }
                  : { background: '#1e2a2c', color: '#bacbc0' }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2.5 rounded-2xl" style={{ background: '#1e2a2c' }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#77ffc8' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
          style={{ borderTop: '1px solid rgba(59,74,66,0.3)' }}>
          <div className="flex gap-2 items-end rounded-2xl px-4 py-3"
            style={{ background: '#1e2a2c', border: '1px solid rgba(59,74,66,0.4)' }}>
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about setting up your truck…"
              className="flex-1 bg-transparent outline-none resize-none text-sm"
              style={{ color: '#dff0e8', maxHeight: 80 }}
            />
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', opacity: !input.trim() || loading ? 0.4 : 1 }}>
              <Send className="w-3.5 h-3.5" style={{ color: '#003826' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}