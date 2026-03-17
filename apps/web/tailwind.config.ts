import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      colors: {
        surface: {
          '950': '#0a0a0f',
          '900': '#111118',
          '800': '#1a1a24',
          '700': '#24243a',
          '600': '#2e2e4a'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
