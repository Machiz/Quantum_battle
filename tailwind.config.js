/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          dark: '#070a0f',
          bg: '#0a0e17',
          panel: '#0f1724',
          border: '#1b2a40',
          cyan: '#00e5ff',
          cyanGlow: 'rgba(0, 229, 255, 0.4)',
          red: '#ff3b5c',
          redGlow: 'rgba(255, 59, 92, 0.4)',
          purple: '#a855f7',
          purpleGlow: 'rgba(168, 85, 247, 0.4)',
          amber: '#f59e0b',
          muted: '#64748b',
          text: '#e2e8f0',
        }
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', '"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Orbitron"', '"Rajdhani"', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'quantum-float': 'quantumFloat 6s infinite ease-in-out',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 16px rgba(0,229,255,0.8))' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        quantumFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      }
    },
  },
  plugins: [],
}
