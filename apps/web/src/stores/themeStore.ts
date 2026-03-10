import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme, ThemeMode, ThemeColor, applyTheme, getStoredTheme } from '../lib/theme';

interface ThemeState {
  theme: Theme;
  mode: ThemeMode;
  color: ThemeColor;
  setMode: (mode: ThemeMode) => void;
  setColor: (color: ThemeColor) => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark-purple', // Fallback initial state, gets hydrated
      mode: 'dark',
      color: 'purple',
      
      setMode: (mode: ThemeMode) => {
        const newTheme: Theme = `${mode}-${get().color}`;
        applyTheme(newTheme);
        set({ mode, theme: newTheme });
      },
      
      setColor: (color: ThemeColor) => {
        const newTheme: Theme = `${get().mode}-${color}`;
        applyTheme(newTheme);
        set({ color, theme: newTheme });
      },

      setTheme: (theme: Theme) => {
        const [mode, color] = theme.split('-') as [ThemeMode, ThemeColor];
        applyTheme(theme);
        set({ theme, mode, color });
      }
    }),
    {
      name: 'sq-theme-store', // persist name
      onRehydrateStorage: () => (state) => {
        // Upon initialization on client side, assert what's strictly correct
        const storedTheme = getStoredTheme();
        if (state && storedTheme !== state.theme) {
          state.setTheme(storedTheme);
        }
      }
    }
  )
);
