/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        senja: {
          50: '#fff7f5',
          100: '#ffeae4',
          200: '#ffd1c5',
          300: '#ffb0a0',
          400: '#ff8a78',
          500: '#ff6a57',
          600: '#f04f42',
          700: '#cc3f3a',
          800: '#9f3532',
          900: '#7f2d2b'
        },
        dusk: {
          50: '#f7f6ff',
          100: '#ebe9ff',
          200: '#d6d2ff',
          300: '#b7aefc',
          400: '#9b8cf7',
          500: '#856ff0',
          600: '#6f56dc',
          700: '#5a45b3',
          800: '#4b3b8e',
          900: '#3d316f'
        }
      },
      backgroundImage: {
        'senja-gradient': 'linear-gradient(135deg, #ffb199 0%, #ff6a57 35%, #9b8cf7 100%)'
      }
    }
  },
  plugins: []
}
