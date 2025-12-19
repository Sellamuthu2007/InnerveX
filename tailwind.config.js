/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#1E1E1E',
        surfaceHighlight: '#2C2C2C',
        primary: '#4285F4', // Google Blue
        secondary: '#9AA0A6', // Google Gray
        success: '#34A853', // Google Green
        warning: '#FBBC04', // Google Yellow
        danger: '#EA4335', // Google Red
        // Dark theme neutrals
        dark: {
          900: '#121212',
          800: '#1E1E1E',
          700: '#2C2C2C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
