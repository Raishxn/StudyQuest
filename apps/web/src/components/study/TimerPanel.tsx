'use client';

import { useTimer } from '../../hooks/useTimer';
import { useHeartbeat } from '../../hooks/useHeartbeat';
import { motion } from 'framer-motion';
import { Play, Pause, Square } from 'lucide-react';
import { useStudySession } from '../../hooks/useStudySession';

interface TimerPanelProps {
  session: any; // The Active Session object from Prisma
  onEndRequest: () => void;
}

export function TimerPanel({ session, onEndRequest }: TimerPanelProps) {
  const { pauseSession, resumeSession, completePomodoro } = useStudySession();

  // Parse session setup
  const isPomodoro = session.mode === 'POMODORO';
  const cycleMins = 25; // in real app, these come from preferences or session metadata if stored
  const breakMins = 5;

  const {
    timeLeft, timeFormatted, progressPercent,
    isRunning, isPaused, phase, cycleCount, totalActiveSeconds,
    pause, resume
  } = useTimer({
    mode: session.mode,
    cycleMinutes: cycleMins,
    breakMinutes: breakMins,
    onCycleComplete: () => {
       if (session.id) completePomodoro.mutate(session.id);
    }
  });

  // Heartbeat runs only if timer is actively running 
  useHeartbeat({ sessionId: session.id, isActive: isRunning && !isPaused });

  const handlePause = () => {
    pause();
    pauseSession.mutate(session.id);
  };

  const handleResume = () => {
    resume();
    resumeSession.mutate(session.id);
  };

  const estimatedXP = Math.min(600, Math.floor((totalActiveSeconds / 60) * 2) + (cycleCount * 5));

  return (
    <div className="md:w-[340px] md:border-l border-border-subtle bg-background-surface h-full flex flex-col justify-between p-6">
      
      {/* Header Info */}
      <div className="text-center mb-8">
        <h3 className="font-bold text-text-primary text-xl font-[family-name:var(--font-cinzel)] uppercase">{session.subject}</h3>
        {session.topic && <p className="text-text-muted text-sm mt-1">{session.topic}</p>}
      </div>

      {/* SVG Circular Timer */}
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[250px] mb-8">
        
        {/* Phase Badge */}
        <div className="absolute top-0 px-3 py-1 bg-background-elevated border border-border-subtle rounded-full text-xs font-bold font-mono tracking-widest text-accent-primary shadow-sm mb-4">
          {!isPomodoro ? '⏱️ AVULSO' : phase === 'FOCUS' ? `🍅 POMODORO #${cycleCount + 1}` : '☕ PAUSA'}
        </div>

        <svg className="w-64 h-64 -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            className="stroke-background-elevated fill-none" strokeWidth="4"
          />
          <motion.circle
            cx="50" cy="50" r="45"
            className={`fill-none stroke-[6] stroke-linecap-round ${
              phase === 'FOCUS' || !isPomodoro ? 'stroke-accent-primary' : 'stroke-info'
            }`}
            strokeDasharray="283" // 2 * pi * 45
            strokeDashoffset={283 - (283 * progressPercent) / 100}
            transition={{ duration: 1, ease: 'linear' }}
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 - (283 * progressPercent) / 100 }}
          />
        </svg>

        {/* Central Time */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl sm:text-5xl font-mono font-bold text-text-primary drop-shadow-md">
            {timeFormatted}
          </span>
          <span className="text-sm font-[family-name:var(--font-cinzel)] text-accent-primary font-bold mt-2 drop-shadow-sm">
             ~+{estimatedXP} XP
          </span>
        </div>

      </div>

      {/* Pomodoro Tracker */}
      {isPomodoro && (
        <div className="flex justify-center gap-2 mb-8">
           {[...Array(4)].map((_, i) => (
             <div 
               key={i} 
               className={`w-3 h-3 rounded-full border border-accent-primary ${i < (cycleCount % 4) ? 'bg-accent-primary shadow-[0_0_8px_rgba(var(--accent-glow),0.8)]' : 'bg-transparent'}`} 
             />
           ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {(!isRunning || isPaused) ? (
          <button 
            onClick={handleResume}
            className="w-16 h-16 rounded-full bg-success text-white flex items-center justify-center shadow-lg hover:bg-success/90 transition-transform active:scale-95"
            title="Retomar"
          >
            <Play fill="currentColor" size={28} />
          </button>
        ) : (
          <button 
            onClick={handlePause}
            className="w-16 h-16 rounded-full bg-background-elevated text-warning border border-warning/30 flex items-center justify-center shadow-lg hover:bg-warning/10 transition-transform active:scale-95"
            title="Pausar"
          >
            <Pause fill="currentColor" size={28} />
          </button>
        )}

        <button 
          onClick={onEndRequest}
          className="w-16 h-16 rounded-full bg-background-elevated text-danger border border-danger/30 flex items-center justify-center shadow-lg hover:bg-danger/10 transition-transform active:scale-95"
          title="Encerrar Sessão"
        >
          <Square fill="currentColor" size={24} />
        </button>
      </div>

    </div>
  );
}
