import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ContentCuratorCard() {
  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [log, setLog] = useState('');
  const [conversation, setConversation] = useState(null);
  const unsubRef = useRef(null);

  // Clean up subscription on unmount
  useEffect(() => () => unsubRef.current?.(), []);

  const runCurator = async () => {
    setStatus('running');
    setLog('');

    const convo = await base44.agents.createConversation({
      agent_name: 'content_curator',
      metadata: { name: 'Admin: Content Curation Run' },
    });
    setConversation(convo);

    // Subscribe to get the agent's response
    unsubRef.current = base44.agents.subscribeToConversation(convo.id, (data) => {
      const msgs = data.messages || [];
      const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant' && m.content);
      if (lastAssistant?.content) {
        setLog(lastAssistant.content);
        // Check if agent is done (no tool calls pending)
        const allDone = msgs.every(m =>
          !m.tool_calls?.some(t => ['running', 'in_progress', 'pending'].includes(t.status))
        );
        if (allDone && lastAssistant.content) setStatus('done');
      }
    });

    await base44.agents.addMessage(convo, {
      role: 'user',
      content: 'Analyze all active LiveClipVideo uploads and update HomepageConfig to feature the best trending food content. Report what you changed.',
    });
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--cc-bg-2)', border: '1px solid rgba(var(--cc-accent-rgb),0.15)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(var(--cc-accent-rgb),0.1)', border: '1px solid rgba(var(--cc-accent-rgb),0.2)' }}>
          <Sparkles className="w-4 h-4" style={{ color: 'var(--cc-accent)' }} />
        </div>
        <div className="flex-1">
          <p className="font-heading font-bold text-sm" style={{ color: 'var(--cc-ink)' }}>AI Content Curator</p>
          <p className="text-[10px]" style={{ color: 'var(--cc-ink-dim)' }}>Analyzes clips · Promotes trending content to homepage</p>
        </div>
        {status === 'done' && <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--cc-accent)' }} />}
      </div>

      <button
        onClick={runCurator}
        disabled={status === 'running'}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
        style={status === 'running'
          ? { background: 'var(--cc-bg-3)', color: 'var(--cc-ink-dim)' }
          : { background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)' }
        }
      >
        <RefreshCw className={`w-4 h-4 ${status === 'running' ? 'animate-spin' : ''}`} />
        {status === 'running' ? 'Curating...' : 'Run Curation Now'}
      </button>

      {log && (
        <div className="mt-4 p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap"
          style={{ background: 'var(--cc-bg-0)', color: 'var(--cc-ink-dim)', border: '1px solid rgba(var(--cc-line-rgb),0.3)' }}>
          {log}
        </div>
      )}

      <p className="text-[10px] mt-3 text-center" style={{ color: 'rgba(186,203,192,0.4)' }}>
        Also runs automatically every day at 8 AM
      </p>
    </div>
  );
}