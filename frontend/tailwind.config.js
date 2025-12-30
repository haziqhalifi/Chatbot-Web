module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          blue: 'var(--primary-blue)',
          dark: 'var(--primary-dark)',
          gray: 'var(--primary-gray)',
          'light-blue': 'var(--primary-light-blue)',
        },
        secondary: {
          white: 'var(--secondary-white)',
          'light-gray': 'var(--secondary-light-gray)',
          'lighter-gray': 'var(--secondary-lighter-gray)',
          'input-bg': 'var(--secondary-input-bg)',
        },
        text: {
          dark: 'var(--text-dark)',
          light: 'var(--text-light)',
          gray: 'var(--text-gray)',
        },
        alert: {
          red: 'var(--alert-red)',
          yellow: 'var(--alert-yellow)',
          green: 'var(--alert-green)',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        chat: '15px',
        sidebar: '22px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
