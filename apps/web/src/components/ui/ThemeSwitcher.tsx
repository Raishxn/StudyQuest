'use client';

import { useThemeStore } from '../../stores/themeStore';
import { Moon, Sun } from 'lucide-react';

export function ThemeSwitcher() {
  const { mode, color, setMode, setColor } = useThemeStore();

  const colors = [
    { name: 'purple', hex: '#9333EA' },
    { name: 'blue', hex: '#2563EB' },
    { name: 'yellow', hex: '#D97706' },
  ] as const;

  return (
    <div className="flex items-center gap-4 bg-background-surface border border-border-subtle p-2 rounded-xl shadow-sm">
      <div className="flex bg-background-base rounded-lg p-1">
        <button
          onClick={() => setMode('dark')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
            mode === 'dark' ? 'bg-background-elevated text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Moon size={16} /> <span className="hidden sm:inline">Escuro</span>
        </button>
        <button
          onClick={() => setMode('light')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
            mode === 'light' ? 'bg-background-elevated text-accent-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Sun size={16} /> <span className="hidden sm:inline">Claro</span>
        </button>
      </div>

      <div className="w-px h-6 bg-border-subtle" />

      <div className="flex gap-2">
        {colors.map((c) => (
          <button
            key={c.name}
            onClick={() => setColor(c.name)}
            className={`w-6 h-6 rounded-full transition-transform ${
              color === c.name ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-background-surface' : 'hover:scale-110'
            }`}
            style={{ backgroundColor: c.hex }}
            aria-label={`Theme color ${c.name}`}
          />
        ))}
      </div>
    </div>
  );
}
