import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Zap } from 'lucide-react';

interface Props {
  level: number;
  onDone: () => void;
}

export default function LevelUpOverlay({ level, onDone }: Props) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#7C3AED', '#B026FF', '#00F5FF', '#A78BFA', '#00FF88'],
      gravity: 0.8,
      scalar: 1.1,
    });

    const timer = setTimeout(onDone, 3200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onDone}
    >
      <div className="text-center" style={{ animation: 'levelUpPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div className="flex items-center justify-center mb-4">
          <Zap size={48} style={{ color: '#B026FF', filter: 'drop-shadow(0 0 20px #B026FF)' }} />
        </div>
        <p className="display text-2xl tracking-widest mb-2" style={{ color: '#64748B' }}>LEVEL UP!</p>
        <p className="display leading-none" style={{
          fontSize: 'clamp(5rem, 20vw, 9rem)',
          background: 'linear-gradient(135deg, #A78BFA 0%, #00F5FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 30px rgba(167,139,250,0.6))',
        }}>{level}</p>
        <p className="display text-xl tracking-widest mt-3 neon-text-cyan">LEVEL {level} REACHED</p>
        <p className="font-body text-sm mt-4" style={{ color: '#475569' }}>Tap to continue</p>
      </div>

      <style>{`
        @keyframes levelUpPop {
          0%   { opacity: 0; transform: scale(0.6); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
