import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0B1B20', soft: '#33474D', mute: '#586B72' },
        mist: '#EDF2F2',
        line: '#D1DBDC',
        deep: { DEFAULT: '#081A1F', 2: '#0E262D', line: '#1F3D45' },
        signal: { DEFAULT: '#0A716C', light: '#6FD3CB' },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque Variable"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
