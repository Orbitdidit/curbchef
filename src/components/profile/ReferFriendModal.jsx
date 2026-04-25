import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ReferFriendModal({ user, onClose }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    // Generate a referral code from user email or name
    if (user?.email) {
      const base = user.full_name?.split(' ')[0]?.toUpperCase() || user.email.split('@')[0].toUpperCase();
      const code = `${base.slice(0, 5)}${Math.abs(hashCode(user.email)) % 9000 + 1000}`;
      setReferralCode(code);
      // Persist to UserProfile if not already saved
      base44.entities.UserProfile.filter({ user_email: user.email }).then(profiles => {
        if (profiles.length > 0 && !profiles[0].referral_code) {
          base44.entities.UserProfile.update(profiles[0].id, { referral_code: code });
        } else if (profiles.length === 0) {
          base44.entities.UserProfile.create({ user_email: user.email, referral_code: code });
        }
      });
    }
  }, [user]);

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: 'Link copied!', description: 'Share it with your friends.', duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on CurbChef 🔥',
        text: `I found the best food trucks on CurbChef. Use my code ${referralCode} and we both earn 500 pts!`,
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg rounded-t-3xl p-6 pb-10" style={{ background: '#151d1f', border: '1px solid rgba(119,255,200,0.15)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>Refer a Friend 🎁</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#2e3638' }}>
            <X className="w-4 h-4" style={{ color: '#bacbc0' }} />
          </button>
        </div>

        {/* How it works */}
        <div className="p-4 rounded-2xl mb-5" style={{ background: '#192123', border: '1px solid rgba(119,255,200,0.1)' }}>
          <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: '#77ffc8' }}>HOW IT WORKS</p>
          <div className="flex flex-col gap-2">
            {[
              { step: '1', text: 'Share your link with a friend' },
              { step: '2', text: 'They sign up & place their first order' },
              { step: '3', text: 'You both earn 500 pts 🎉' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black"
                  style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>{step}</div>
                <p className="text-sm" style={{ color: '#bacbc0' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral code */}
        <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#bacbc0' }}>YOUR CODE</p>
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-4" style={{ background: '#0d1517', border: '1px solid rgba(119,255,200,0.2)' }}>
          <p className="font-heading font-black text-2xl tracking-widest flex-1" style={{ color: '#77ffc8' }}>{referralCode}</p>
          <button onClick={handleCopy} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: copied ? 'rgba(119,255,200,0.15)' : '#2e3638' }}>
            {copied ? <Check className="w-4 h-4" style={{ color: '#77ffc8' }} /> : <Copy className="w-4 h-4" style={{ color: '#bacbc0' }} />}
          </button>
        </div>

        {/* Share button */}
        <button onClick={handleShare}
          className="w-full py-4 rounded-full font-heading font-black text-base flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 20px rgba(119,255,200,0.35)' }}>
          <Share2 className="w-5 h-5" />
          Share My Link
        </button>
      </div>
    </div>
  );
}