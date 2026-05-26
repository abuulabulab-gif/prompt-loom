/** @type {import('tailwindcss').Config} */
// LOOM design tokens. Colors map to CSS variables defined in src/index.css,
// which switch on [data-theme="light"]. This lets every Tailwind class
// (bg-surface, text-fg, border-line ...) follow the active theme automatically,
// removing the need for the runtime-mutated `C` object from the prototype.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:        'rgb(var(--bg) / <alpha-value>)',
        surface:   'rgb(var(--surface) / <alpha-value>)',
        surfalt:   'rgb(var(--surface-alt) / <alpha-value>)',
        panel:     'rgb(var(--panel) / <alpha-value>)',
        inputbg:   'rgb(var(--input-bg) / <alpha-value>)',
        line:      'rgb(var(--border) / <alpha-value>)',
        linebright:'rgb(var(--border-bright) / <alpha-value>)',
        fg:        'rgb(var(--text) / <alpha-value>)',
        muted:     'rgb(var(--muted) / <alpha-value>)',
        dim:       'rgb(var(--dim) / <alpha-value>)',
        // tinted surface tokens (theme-sensitive, dark values hardcoded before)
        'output-border': 'rgb(var(--output-border) / <alpha-value>)',
        'tint-accent':   'rgb(var(--tint-accent)   / <alpha-value>)',
        'tint-warn':     'rgb(var(--tint-warn)      / <alpha-value>)',
        'tint-warn-tag': 'rgb(var(--tint-warn-tag)  / <alpha-value>)',
        'tint-danger':   'rgb(var(--tint-danger)    / <alpha-value>)',
        'warn-text':     'rgb(var(--warn-text)      / <alpha-value>)',
        'prompt':        'rgb(var(--prompt-text)    / <alpha-value>)',
        // semantic accents (theme-sensitive via CSS vars)
        accent:    'rgb(var(--c-blue)    / <alpha-value>)',
        good:      'rgb(var(--good-text) / <alpha-value>)',
        warn:      'rgb(var(--warn-text) / <alpha-value>)',
        danger:    'rgb(var(--c-red)     / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Segoe UI"', '"Noto Sans JP"', '-apple-system', 'sans-serif'],
        mono: ['"SFMono-Regular"', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};
