/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#757de8',
          DEFAULT: '#3f51b5',
          dark: '#002984',
        },
        accent: {
          light: '#ff6090',
          DEFAULT: '#f50057',
          dark: '#bb002f',
        },
        gameTable: {
          DEFAULT: '#2c8338',
          dark: '#1e5f28',
        }
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      animation: {
        'card-flip': 'flip 0.5s ease-in-out',
        'card-slide': 'slide 0.3s ease-out',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        slide: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        }
      },
      boxShadow: {
        'card': '0 4px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 16px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
