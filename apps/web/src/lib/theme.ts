export type ThemeMode = 'dark' | 'light';
export type ThemeColor = 'purple' | 'blue' | 'yellow';
export type Theme = `${ThemeMode}-${ThemeColor}`;

export const applyTheme = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('studyquest-theme', theme);
  }
};

export const getStoredTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('studyquest-theme') as Theme | null;
    if (stored) return stored;
    
    // Default fallback based on system prefs
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light-purple';
    }
  }
  return 'dark-purple'; // Default
};
