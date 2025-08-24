// file: tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-background': '#121212',
        'brand-surface': '#1E1E1E',
        'brand-primary': '#E54593',
        'brand-secondary': '#B0B0B0',
        'brand-text': '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      // ADD THIS ANIMATION BLOCK
      animation: {
        'infinite-scroll': 'infinite-scroll 40s linear infinite',
      },
      keyframes: {
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
export default config