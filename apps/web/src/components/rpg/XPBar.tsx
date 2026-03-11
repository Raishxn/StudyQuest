'use client';

import { motion } from 'framer-motion';

interface XPBarProps {
  currentXP: number;
  currentLevel: number;
  xpForNextLevel: number;
  xpPreviousLevel: number;
  title?: string;
}

export function XPBar({ 
  currentXP, 
  currentLevel, 
  xpForNextLevel, 
  xpPreviousLevel,
  title = "Acadêmico" 
}: XPBarProps) {
  
  const totalInLevel = xpForNextLevel - xpPreviousLevel;
  const currentInLevel = currentXP - xpPreviousLevel;
  const percentage = Math.max(0, Math.min(100, (currentInLevel / totalInLevel) * 100));

  return (
    <div className="w-full max-w-sm flex flex-col gap-1.5">
      <div className="flex justify-between items-end px-1">
        <span className="text-sm font-bold text-text-primary font-display uppercase tracking-wide">
          Nível {currentLevel} <span className="text-text-muted px-1">—</span> <span className="text-accent-primary">⚡ {title}</span>
        </span>
        <span className="text-xs text-text-muted font-mono font-medium">
          {currentXP} / {xpForNextLevel} XP
        </span>
      </div>
      
      <div className="h-3 w-full bg-background-elevated rounded-full overflow-hidden border border-border-subtle relative shadow-inner">
        <motion.div 
          className="h-full bg-accent-primary shadow-[0_0_10px_rgba(var(--accent-glow),0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        />
      </div>
    </div>
  );
}
