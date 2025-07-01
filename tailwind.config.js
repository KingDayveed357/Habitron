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
          light: "var(--color-primary-light)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary-default)",
          light: "var(--color-secondary-light)",
        },
        tertiary: {
          DEFAULT: "var(--color-tertiary-default)",
          light: "var(--color-tertiary-light)",
        },
        accent: {
          DEFAULT: "var(--color-accent-default)",
          light: "var(--color-accent-light)",
        },
        grey: {
          DEFAULT: "var(--color-grey-default)",
        },
        slate: {
          DEFAULT: "var(--color-slate-default)",
        },
        dark: {
          DEFAULT: "var(--color-dark-default)",
        },
        light: {
          DEFAULT: "var(--color-light-default)",
        },
        overlay: "var(--color-overlay)",
        
        // Semantic colors
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: "var(--color-card)",
        border: "var(--color-border)",
        
        // Component-specific colors
        'btn-primary': "var(--color-button-primary)",
        'btn-primary-text': "var(--color-button-primary-text)",
        'btn-primary-hover': "var(--color-button-primary-hover)",
        
        'btn-secondary': "var(--color-button-secondary)",
        'btn-secondary-text': "var(--color-button-secondary-text)",
        'btn-secondary-hover': "var(--color-button-secondary-hover)",
        
        'btn-danger': "var(--color-button-danger)",
        'btn-danger-text': "var(--color-button-danger-text)",
        'btn-danger-hover': "var(--color-button-danger-hover)",
        
        'input-bg': "var(--color-input-background)",
        'input-border': "var(--color-input-border)",
        'input-text': "var(--color-input-text)",
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