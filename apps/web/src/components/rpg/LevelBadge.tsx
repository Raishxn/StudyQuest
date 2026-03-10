interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  const getEmojiForLevel = (lvl: number) => {
    if (lvl >= 7) return '👑';
    if (lvl >= 6) return '🧙‍♂️';
    if (lvl >= 5) return '🔮';
    if (lvl >= 4) return '⚔️';
    if (lvl >= 3) return '🛡️';
    if (lvl >= 2) return '📜';
    return '🌱';
  };

  const isMaxLevel = level >= 7;

  return (
    <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full drop-shadow-md"
      >
        <polygon 
          points="50 3, 95 25, 95 75, 50 97, 5 75, 5 25" 
          className="fill-background-surface stroke-background-elevated stroke-[4]"
        />
        <polygon 
          points="50 8, 88 28, 88 72, 50 92, 12 72, 12 28" 
          className={`fill-background-base stroke-[3] ${
            isMaxLevel ? 'stroke-accent-glow' : 'stroke-accent-primary'
          }`}
        />
      </svg>
      
      {isMaxLevel && (
        <div className="absolute inset-1 rounded-full bg-[conic-gradient(from_0deg,transparent,hsl(var(--accent-primary)),transparent)] animate-spin" style={{ animationDuration: '3s' }} />
      )}
      
      <span className="relative z-10 z-[1] drop-shadow-sm pointer-events-none">
        {getEmojiForLevel(level)}
      </span>
      
      {/* Tiny level number at the bottom */}
      <div className="absolute -bottom-1 z-20 bg-accent-primary text-white text-[10px] sm:text-xs font-bold font-mono px-1.5 rounded-sm shadow-sm border border-black/20">
        {level}
      </div>
    </div>
  );
}
