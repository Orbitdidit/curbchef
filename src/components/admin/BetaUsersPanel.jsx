import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function BetaUsersPanel({ adminEmail }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const { data: betaUsers = [], isLoading } = useQuery({
    queryKey: ['beta-users'],
    queryFn: () => base44.entities.BetaUser.list('-created_date', 100),
  });

  const addUser = useMutation({
    mutationFn: () => base44.entities.BetaUser.create({
      email: email.trim().toLowerCase(),
      added_by: adminEmail,
      added_date: new Date().toISOString(),
      notes: notes.trim(),
      is_active: true,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beta-users'] });
      setEmail('');
      setNotes('');
      toast({ title: '✅ Beta user added!' });
    },
  });

  const removeUser = useMutation({
    mutationFn: (id) => base44.entities.BetaUser.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beta-users'] });
      toast({ title: 'Beta user removed.' });
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.BetaUser.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['beta-users'] }),
  });

  return (
    <div>
      {/* Add form */}
      <div className="p-4 rounded-2xl mb-4" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
        <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>ADD BETA USER</p>
        <div className="flex flex-col gap-2 mb-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }}
          />
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }}
          />
        </div>
        <button
          onClick={() => addUser.mutate()}
          disabled={!email.trim() || addUser.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}
        >
          <UserPlus className="w-4 h-4" />
          Add Beta User
        </button>
      </div>

      {/* Beta users list */}
      <div className="flex flex-col gap-2">
        {isLoading && <p className="text-xs" style={{ color: '#bacbc0' }}>Loading...</p>}
        {!isLoading && betaUsers.length === 0 && (
          <p className="text-xs py-4 text-center" style={{ color: '#bacbc0' }}>No beta users yet.</p>
        )}
        {betaUsers.map(u => (
          <div key={u.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: '#192123', border: u.is_active ? '1px solid rgba(119,255,200,0.15)' : '1px solid rgba(59,74,66,0.2)', opacity: u.is_active ? 1 : 0.5 }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#dff0e8' }}>{u.email}</p>
              {u.notes && <p className="text-xs truncate" style={{ color: '#bacbc0' }}>{u.notes}</p>}
              <p className="text-[10px]" style={{ color: '#6B665C' }}>Added by {u.added_by}</p>
            </div>
            <button
              onClick={() => toggleActive.mutate({ id: u.id, is_active: !u.is_active })}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
              style={u.is_active
                ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8' }
                : { background: 'rgba(59,74,66,0.2)', color: '#bacbc0' }}
            >
              {u.is_active ? 'Active' : 'Inactive'}
            </button>
            <button
              onClick={() => removeUser.mutate(u.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}