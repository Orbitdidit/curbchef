import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronLeft, Plus, X, Check, AlertTriangle, Zap, Clock, Flag, Edit2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PRIORITY_STYLE = {
  Critical: { bg: 'rgba(255,59,48,0.15)', color: '#ff3b30', border: 'rgba(255,59,48,0.35)' },
  High:     { bg: 'rgba(253,89,30,0.15)', color: '#fd591e', border: 'rgba(253,89,30,0.35)' },
  Medium:   { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: 'rgba(251,191,36,0.35)' },
  Low:      { bg: 'rgba(186,203,192,0.1)', color: '#bacbc0', border: 'rgba(186,203,192,0.2)' },
};

const STATUS_STYLE = {
  'Not Started': { bg: 'rgba(186,203,192,0.08)', color: '#bacbc0' },
  'In Progress': { bg: 'rgba(119,255,200,0.1)', color: '#77ffc8' },
  'Blocked':     { bg: 'rgba(255,59,48,0.15)', color: '#ff3b30' },
  'Needs Test':  { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
  'Complete':    { bg: 'rgba(119,255,200,0.15)', color: '#00e6a7' },
};

const SCORECARD_ITEMS = [
  { key: 'vendor_signup', label: 'Vendor signup working' },
  { key: 'vendor_dashboard', label: 'Vendor dashboard working' },
  { key: 'vendor_pages', label: 'Vendor pages working' },
  { key: 'stripe_checkout', label: 'Stripe / checkout working' },
  { key: 'ordering_flow', label: 'Ordering flow working' },
  { key: 'admin_panel', label: 'Admin panel working' },
  { key: 'settings_page', label: 'Settings page working' },
  { key: 'live_video', label: 'Live video uploader working' },
  { key: 'thumbnail', label: 'Thumbnail handling decided' },
  { key: 'mobile', label: 'Mobile responsive' },
  { key: 'legal', label: 'Policies / terms / privacy added' },
  { key: 'support', label: 'Contact / help support flow added' },
];

const DEFAULT_TASKS = [
  { title: 'Fix Stripe Connect onboarding redirect', category: 'Payments', priority: 'Critical', status: 'In Progress', owner: 'Dev', affected_page: '/vendor', notes: 'Return URL needs to point to live domain', launch_blocker: true },
  { title: 'Privacy Policy & Terms of Service pages', category: 'Legal', priority: 'Critical', status: 'Not Started', owner: 'Legal', affected_page: '/privacy, /terms', notes: 'Required before app store submission', launch_blocker: true },
  { title: 'Test full checkout flow end-to-end', category: 'Payments', priority: 'Critical', status: 'Needs Test', owner: 'QA', affected_page: '/cart, /order', notes: 'Test with real card + Apple Pay', launch_blocker: true },
  { title: 'Vendor order accept / reject flow', category: 'Vendor Flow', priority: 'Critical', status: 'Needs Test', owner: 'Dev', affected_page: '/vendor/orders', notes: '', launch_blocker: true },
  { title: 'Mobile responsive audit — all pages', category: 'Mobile', priority: 'High', status: 'In Progress', owner: 'Dev', affected_page: 'All', notes: 'Check iOS Safari overflow issues', launch_blocker: false },
  { title: 'Live video upload + thumbnail preview', category: 'Media', priority: 'High', status: 'Complete', owner: 'Dev', affected_page: '/admin/homepage', notes: 'Auto-thumbnail from frame capture done', launch_blocker: false },
  { title: 'Customer order confirmation email', category: 'Customer Flow', priority: 'High', status: 'Not Started', owner: 'Dev', affected_page: '/order/:id', notes: 'Trigger on order placed', launch_blocker: false },
  { title: 'Admin dashboard vendor approval email', category: 'Admin', priority: 'High', status: 'Complete', owner: 'Dev', affected_page: '/admin', notes: 'Auto-sends on approval', launch_blocker: false },
  { title: 'Map view — truck markers with real coordinates', category: 'Customer Flow', priority: 'High', status: 'Needs Test', owner: 'Dev', affected_page: '/map', notes: 'Seed real Houston coordinates', launch_blocker: false },
  { title: 'Pickup code generation & display', category: 'Customer Flow', priority: 'Medium', status: 'Complete', owner: 'Dev', affected_page: '/order/:id', notes: '', launch_blocker: false },
  { title: 'Vendor Stripe payout dashboard', category: 'Payments', priority: 'Medium', status: 'In Progress', owner: 'Dev', affected_page: '/vendor', notes: 'Show net earnings after platform fee', launch_blocker: false },
  { title: 'Contact / support page', category: 'Legal', priority: 'Medium', status: 'Not Started', owner: 'Product', affected_page: '/support', notes: 'Simple form or Intercom widget', launch_blocker: false },
  { title: 'SEO meta tags + OG images', category: 'Infrastructure', priority: 'Medium', status: 'Not Started', owner: 'Dev', affected_page: 'index.html', notes: '', launch_blocker: false },
  { title: 'Push notifications for order status', category: 'Customer Flow', priority: 'Low', status: 'Not Started', owner: 'Dev', affected_page: 'All', notes: 'Nice to have post-launch', launch_blocker: false },
  { title: 'Referral system', category: 'Nice to Have', priority: 'Low', status: 'Not Started', owner: 'Product', affected_page: '/profile', notes: 'Referral codes in UserProfile', launch_blocker: false },
];

function Badge({ label, styleObj }) {
  return (
    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
      style={{ background: styleObj.bg, color: styleObj.color, border: `1px solid ${styleObj.border || styleObj.color + '33'}` }}>
      {label}
    </span>
  );
}

function TaskRow({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(task);
  const ps = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.Low;
  const ss = STATUS_STYLE[task.status] || STATUS_STYLE['Not Started'];

  const save = () => { onUpdate(form); setEditing(false); };

  if (editing) {
    return (
      <tr style={{ background: 'rgba(119,255,200,0.03)' }}>
        <td className="px-3 py-2" colSpan={7}>
          <div className="flex flex-col gap-2">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg px-3 py-1.5 text-sm outline-none"
              style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(119,255,200,0.3)' }} />
            <div className="flex flex-wrap gap-2">
              {['priority', 'status', 'category', 'owner', 'affected_page'].map(field => (
                field === 'priority' ? (
                  <select key={field} value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="rounded-lg px-2 py-1 text-xs outline-none"
                    style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }}>
                    {['Critical','High','Medium','Low'].map(v => <option key={v}>{v}</option>)}
                  </select>
                ) : field === 'status' ? (
                  <select key={field} value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="rounded-lg px-2 py-1 text-xs outline-none"
                    style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }}>
                    {['Not Started','In Progress','Blocked','Needs Test','Complete'].map(v => <option key={v}>{v}</option>)}
                  </select>
                ) : (
                  <input key={field} placeholder={field.replace('_', ' ')} value={form[field] || ''}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="rounded-lg px-2 py-1 text-xs outline-none"
                    style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)', minWidth: 80 }} />
                )
              ))}
              <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: '#bacbc0' }}>
                <input type="checkbox" checked={form.launch_blocker || false}
                  onChange={e => setForm(f => ({ ...f, launch_blocker: e.target.checked }))} />
                Blocker
              </label>
            </div>
            <textarea placeholder="Notes" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={1} className="w-full rounded-lg px-3 py-1.5 text-xs outline-none resize-none"
              style={{ background: '#0d1517', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.3)' }} />
            <div className="flex gap-2">
              <button onClick={save} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
                <Save className="w-3 h-3" /> Save
              </button>
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: '#2e3638', color: '#bacbc0' }}>Cancel</button>
              <button onClick={() => onDelete(task.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold ml-auto"
                style={{ background: 'rgba(255,59,48,0.12)', color: '#ff3b30' }}>Delete</button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b transition-colors hover:bg-white/[0.02]"
      style={{ borderColor: 'rgba(59,74,66,0.12)', background: task.launch_blocker && task.status === 'Blocked' ? 'rgba(255,59,48,0.03)' : 'transparent' }}>
      <td className="px-3 py-3 min-w-[200px]">
        <div className="flex items-start gap-2">
          {task.launch_blocker && <Flag className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#ff3b30' }} />}
          <span className="text-sm font-semibold" style={{ color: '#dff0e8' }}>{task.title}</span>
        </div>
        {task.notes && <p className="text-xs mt-0.5 ml-5 line-clamp-1" style={{ color: '#bacbc0' }}>{task.notes}</p>}
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <Badge label={task.priority} styleObj={ps} />
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.color }}>
          {task.status}
        </span>
      </td>
      <td className="px-3 py-3 text-xs" style={{ color: '#bacbc0' }}>{task.category}</td>
      <td className="px-3 py-3 text-xs" style={{ color: '#bacbc0' }}>{task.owner || '—'}</td>
      <td className="px-3 py-3 text-xs" style={{ color: '#bacbc0' }}>{task.affected_page || '—'}</td>
      <td className="px-3 py-3">
        <button onClick={() => setEditing(true)} className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: '#192123' }}>
          <Edit2 className="w-3 h-3" style={{ color: '#bacbc0' }} />
        </button>
      </td>
    </tr>
  );
}

function AddTaskRow({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Customer Flow', priority: 'Medium', status: 'Not Started', owner: '', affected_page: '', notes: '', launch_blocker: false });

  const submit = () => {
    if (!form.title.trim()) return;
    onAdd(form);
    setForm({ title: '', category: 'Customer Flow', priority: 'Medium', status: 'Not Started', owner: '', affected_page: '', notes: '', launch_blocker: false });
    setOpen(false);
  };

  if (!open) return (
    <tr>
      <td colSpan={7} className="px-3 py-2">
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg"
          style={{ background: 'rgba(119,255,200,0.06)', color: '#77ffc8', border: '1px dashed rgba(119,255,200,0.25)' }}>
          <Plus className="w-3.5 h-3.5" /> Add task
        </button>
      </td>
    </tr>
  );

  return (
    <tr style={{ background: 'rgba(119,255,200,0.03)' }}>
      <td className="px-3 py-2" colSpan={7}>
        <div className="flex flex-col gap-2">
          <input autoFocus placeholder="Task title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg px-3 py-1.5 text-sm outline-none"
            style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(119,255,200,0.3)' }} />
          <div className="flex flex-wrap gap-2">
            {[
              { field: 'priority', opts: ['Critical','High','Medium','Low'] },
              { field: 'status', opts: ['Not Started','In Progress','Blocked','Needs Test','Complete'] },
              { field: 'category', opts: ['Vendor Flow','Customer Flow','Admin','Payments','Media','Mobile','Legal','Bug','Nice to Have','Infrastructure'] },
            ].map(({ field, opts }) => (
              <select key={field} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="rounded-lg px-2 py-1 text-xs outline-none"
                style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }}>
                {opts.map(v => <option key={v}>{v}</option>)}
              </select>
            ))}
            {['owner', 'affected_page'].map(f => (
              <input key={f} placeholder={f.replace('_', ' ')} value={form[f]}
                onChange={e => setForm(fd => ({ ...fd, [f]: e.target.value }))}
                className="rounded-lg px-2 py-1 text-xs outline-none"
                style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)', minWidth: 80 }} />
            ))}
            <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: '#bacbc0' }}>
              <input type="checkbox" checked={form.launch_blocker}
                onChange={e => setForm(f => ({ ...f, launch_blocker: e.target.checked }))} />
              Launch Blocker
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
              <Plus className="w-3 h-3" /> Add
            </button>
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: '#2e3638', color: '#bacbc0' }}>Cancel</button>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function LaunchDashboard() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('all');
  const [scorecard, setScorecard] = useState({});

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['launch-tasks'],
    queryFn: () => base44.entities.LaunchTask.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LaunchTask.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['launch-tasks'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => base44.entities.LaunchTask.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['launch-tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LaunchTask.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['launch-tasks'] }),
  });

  // Seed defaults if empty
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (!isLoading && tasks.length === 0 && !seeded.current) {
      seeded.current = true;
      DEFAULT_TASKS.forEach(t => createMutation.mutate(t));
    }
  }, [isLoading, tasks.length]);

  // Stats
  const total = tasks.length;
  const complete = tasks.filter(t => t.status === 'Complete').length;
  const blocked = tasks.filter(t => t.status === 'Blocked').length;
  const criticalOpen = tasks.filter(t => t.priority === 'Critical' && t.status !== 'Complete').length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0;
  const launchReady = criticalOpen === 0 && blocked === 0 ? 'green' : criticalOpen <= 2 && blocked <= 1 ? 'yellow' : 'red';
  const launchReadyStyle = { green: { color: '#77ffc8', label: '🟢 Ready to Launch' }, yellow: { color: '#fbbf24', label: '🟡 Almost Ready' }, red: { color: '#ff3b30', label: '🔴 Not Ready' } }[launchReady];

  const blockers = tasks.filter(t => t.launch_blocker || t.status === 'Blocked');
  const criticalLeft = tasks.filter(t => t.priority === 'Critical' && t.status !== 'Complete').sort((a, b) => (a.status === 'Blocked' ? -1 : 1));
  const recentlyUpdated = [...tasks].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date)).slice(0, 5);

  const SECTIONS = [
    { id: 'all', label: 'All Tasks' },
    { id: 'critical', label: 'Critical', filter: t => t.priority === 'Critical' },
    { id: 'bugs', label: 'Bugs', filter: t => t.category === 'Bug' },
    { id: 'testing', label: 'Needs Test', filter: t => t.status === 'Needs Test' },
    { id: 'nice', label: 'Nice to Have', filter: t => t.category === 'Nice to Have' },
    { id: 'complete', label: 'Complete', filter: t => t.status === 'Complete' },
  ];

  const displayedTasks = activeSection === 'all' ? tasks : tasks.filter(SECTIONS.find(s => s.id === activeSection)?.filter || (() => true));

  return (
    <div className="min-h-screen dot-bg pb-16" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4"
        style={{ background: 'rgba(13,21,23,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(59,74,66,0.15)' }}>
        <div className="flex items-center gap-3">
          <Link to="/admin" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
            <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
          </Link>
          <div className="flex-1">
            <h1 className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>🚀 Launch Command Center</h1>
            <p className="text-xs" style={{ color: '#bacbc0' }}>CurbChef pre-launch readiness tracker</p>
          </div>
          <span className="text-sm font-black px-3 py-1.5 rounded-full" style={{ background: launchReady === 'green' ? 'rgba(119,255,200,0.12)' : launchReady === 'yellow' ? 'rgba(251,191,36,0.12)' : 'rgba(255,59,48,0.12)', color: launchReadyStyle.color }}>
            {launchReadyStyle.label}
          </span>
        </div>
      </div>

      <div className="px-5 py-5 flex flex-col gap-6 max-w-5xl mx-auto">

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[
            { label: 'Total', value: total, color: '#bacbc0' },
            { label: 'Complete', value: complete, color: '#77ffc8' },
            { label: 'Blocked', value: blocked, color: '#ff3b30' },
            { label: 'Critical Open', value: criticalOpen, color: '#fd591e' },
            { label: '% Done', value: `${pct}%`, color: pct >= 80 ? '#77ffc8' : pct >= 50 ? '#fbbf24' : '#ff3b30' },
            { label: 'Blockers', value: blockers.length, color: blockers.length === 0 ? '#77ffc8' : '#ff3b30' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-2xl text-center" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
              <p className="font-heading font-black text-2xl" style={{ color }}>{value}</p>
              <p className="text-[10px] font-bold mt-0.5" style={{ color: '#bacbc0' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── PROGRESS BAR ── */}
        <div className="p-4 rounded-2xl" style={{ background: '#192123' }}>
          <div className="flex justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: '#bacbc0' }}>Launch Progress</span>
            <span className="text-xs font-black" style={{ color: '#77ffc8' }}>{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#2e3638' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: pct >= 80 ? 'linear-gradient(90deg,#77ffc8,#00e6a7)' : pct >= 50 ? 'linear-gradient(90deg,#fbbf24,#fd591e)' : 'linear-gradient(90deg,#ff3b30,#fd591e)' }} />
          </div>
        </div>

        {/* ── CURRENT BLOCKERS ── */}
        {blockers.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,59,48,0.25)', background: 'rgba(255,59,48,0.03)' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ background: 'rgba(255,59,48,0.08)', borderBottom: '1px solid rgba(255,59,48,0.15)' }}>
              <AlertTriangle className="w-4 h-4" style={{ color: '#ff3b30' }} />
              <p className="font-heading font-black text-sm" style={{ color: '#ff3b30' }}>Current Blockers</p>
              <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,59,48,0.2)', color: '#ff3b30' }}>{blockers.length}</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(255,59,48,0.1)' }}>
              {blockers.map(t => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                  <Flag className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ff3b30' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: '#dff0e8' }}>{t.title}</p>
                    {t.notes && <p className="text-xs" style={{ color: '#bacbc0' }}>{t.notes}</p>}
                  </div>
                  <Badge label={t.priority} styleObj={PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.Low} />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: STATUS_STYLE[t.status]?.bg, color: STATUS_STYLE[t.status]?.color }}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WHAT'S LEFT ── */}
        {criticalLeft.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(59,74,66,0.15)' }}>
              <Zap className="w-4 h-4" style={{ color: '#77ffc8' }} />
              <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>What's Left Before Launch</p>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(59,74,66,0.1)' }}>
              {criticalLeft.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-black w-5 flex-shrink-0" style={{ color: '#bacbc0' }}>{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: '#dff0e8' }}>{t.title}</p>
                    <p className="text-xs" style={{ color: '#bacbc0' }}>{t.category} · {t.affected_page || '—'}</p>
                  </div>
                  <Badge label={t.priority} styleObj={PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.Low} />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: STATUS_STYLE[t.status]?.bg, color: STATUS_STYLE[t.status]?.color }}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LAUNCH SCORECARD ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(59,74,66,0.15)' }}>
            <Check className="w-4 h-4" style={{ color: '#77ffc8' }} />
            <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>Launch Scorecard</p>
            <span className="ml-auto text-xs font-bold" style={{ color: '#bacbc0' }}>
              {Object.values(scorecard).filter(Boolean).length} / {SCORECARD_ITEMS.length} passing
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(59,74,66,0.1)' }}>
            {SCORECARD_ITEMS.map(item => {
              const passing = !!scorecard[item.key];
              return (
                <div key={item.key} className="flex items-center gap-3 px-5 py-3 cursor-pointer select-none"
                  onClick={() => setScorecard(s => ({ ...s, [item.key]: !s[item.key] }))}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: passing ? 'rgba(119,255,200,0.15)' : 'rgba(255,59,48,0.1)', border: `1px solid ${passing ? 'rgba(119,255,200,0.4)' : 'rgba(255,59,48,0.25)'}` }}>
                    {passing ? <Check className="w-3 h-3" style={{ color: '#77ffc8' }} /> : <X className="w-3 h-3" style={{ color: '#ff3b30' }} />}
                  </div>
                  <p className="flex-1 text-sm" style={{ color: '#dff0e8' }}>{item.label}</p>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: passing ? 'rgba(119,255,200,0.12)' : 'rgba(255,59,48,0.1)', color: passing ? '#77ffc8' : '#ff3b30' }}>
                    {passing ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RECENTLY UPDATED ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(59,74,66,0.15)' }}>
            <Clock className="w-4 h-4" style={{ color: '#bacbc0' }} />
            <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>Recently Updated</p>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(59,74,66,0.1)' }}>
            {recentlyUpdated.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#dff0e8' }}>{t.title}</p>
                  <p className="text-xs" style={{ color: '#bacbc0' }}>{new Date(t.updated_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <Badge label={t.priority} styleObj={PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.Low} />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: STATUS_STYLE[t.status]?.bg, color: STATUS_STYLE[t.status]?.color }}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TASK TABLE ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
          <div className="flex items-center gap-2 px-5 py-3 flex-wrap" style={{ borderBottom: '1px solid rgba(59,74,66,0.15)' }}>
            <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>All Tasks</p>
            <div className="flex gap-1.5 ml-auto overflow-x-auto no-scrollbar">
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all"
                  style={activeSection === s.id
                    ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }
                    : { background: '#2e3638', color: '#bacbc0' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(59,74,66,0.2)' }}>
                  {['Task', 'Priority', 'Status', 'Category', 'Owner', 'Page', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-black tracking-wider" style={{ color: '#bacbc0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-sm" style={{ color: '#bacbc0' }}>Loading...</td></tr>
                ) : displayedTasks.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-sm" style={{ color: '#bacbc0' }}>No tasks in this section</td></tr>
                ) : displayedTasks.map(task => (
                  <TaskRow key={task.id} task={task}
                    onUpdate={(form) => updateMutation.mutate({ id: task.id, ...form })}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
                <AddTaskRow onAdd={(data) => createMutation.mutate(data)} />
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}