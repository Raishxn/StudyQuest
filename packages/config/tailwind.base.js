/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
      },
      colors: {
        background: {
          base: "hsl(var(--bg-base))",
          surface: "hsl(var(--bg-surface))",
          elevated: "hsl(var(--bg-elevated))",
          overlay: "hsl(var(--bg-overlay))"
        },
        accent: {
          primary: "hsl(var(--accent-primary))",
          secondary: "hsl(var(--accent-secondary))",
          muted: "hsl(var(--accent-muted))",
          glow: "hsl(var(--accent-glow))"
        },
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
          inverse: "hsl(var(--text-inverse))"
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        info: "hsl(var(--info))",
        border: {
          subtle: "hsl(var(--border-subtle))",
          strong: "hsl(var(--border-strong))"
        }
      }
    }
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")]
};
