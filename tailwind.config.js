/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: "var(--color-primary-default)",
          
        },
        grey: {
          DEFAULT: "var(--color-grey-default)",
        },
        dark: {
          DEFAULT: "var(--color-dark-default)",
        },
        light: {
          DEFAULT: "var(--color-light-default)",
        },
        
        // Semantic colors
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: "var(--color-card)",
        border: "var(--color-border)",
        
        // Component-specific colors
        'btn-primary': "var(--color-button-primary)",
        'btn-primary-text': "var(--color-button-primary-text)",
        'btn-primary-hover': "var(--color-button-primary-hover)",
        
        
        'input-bg': "var(--color-input-background)",
        'input-placeholder': "var(--color-input-placeholder)",
        
        'text-primary': "var(--color-text-primary)",
        'text-secondary': "var(--color-text-secondary)",
        'text-muted': "var(--color-text-muted)",
        
        'surface': "var(--color-surface)",
        'surface-secondary': "var(--color-surface-secondary)",
        'surface-tertiary': "var(--color-surface-tertiary)",
      },
    },
  },
  plugins: [],
};