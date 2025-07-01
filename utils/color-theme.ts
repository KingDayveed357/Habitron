// utils/color-theme.ts - Enhanced with semantic colors
import { vars } from "nativewind";

export const themes = {
  light: vars({
    // Brand colors
    "--color-primary-default": "#3a5e96",
    "--color-primary-light": "#5bd1e7",
    "--color-secondary-default": "#9b6cca",
    "--color-secondary-light": "#dfbeff",
    "--color-tertiary-default": "#ff88bd",
    "--color-tertiary-light": "#ffc2e6",
    "--color-accent-default": "#f9c04a",
    "--color-accent-light": "#ffeea9",
    "--color-grey-default": "#979797",
    "--color-slate-default": "#38383a",
    "--color-dark-default": "#1f355b",
    "--color-light-default": "#FCFDFD",
    "--color-overlay": "rgba(0, 0, 0, 0.05)",
    
    // Semantic colors - App level
    "--color-background": "#f3f4f6",
    "--color-foreground": "#000000",
    "--color-card": "#f8f9fa",
    "--color-border": "#e5e7eb",
    
    // Component-specific semantic colors
    "--color-button-primary": "#4f46e5", // indigo-600
    "--color-button-primary-text": "#ffffff",
    "--color-button-primary-hover": "#4338ca", // indigo-700
    
    "--color-button-secondary": "#6b7280", // gray-500
    "--color-button-secondary-text": "#ffffff",
    "--color-button-secondary-hover": "#4b5563", // gray-600
    
    "--color-button-danger": "#dc2626", // red-600
    "--color-button-danger-text": "#ffffff",
    "--color-button-danger-hover": "#b91c1c", // red-700
    
    "--color-input-background": "#ffffff",
    "--color-input-border": "#d1d5db", // gray-300
    "--color-input-text": "#111827", // gray-900
    "--color-input-placeholder": "#6b7280", // gray-500
    
    "--color-text-primary": "#111827", // gray-900
    "--color-text-secondary": "#000000", // gray-500
    "--color-text-muted": "#9ca3af", // gray-400
    
    "--color-surface": "#ffffff",
    "--color-surface-secondary": "#f9fafb", // gray-50
    "--color-surface-tertiary": "#f3f4f6", // gray-100
  }),
  
  dark: vars({
    // Brand colors (slightly adjusted for dark mode)
    "--color-primary-default": "#5a7bb8",
    "--color-primary-light": "#7bdff5",
    "--color-secondary-default": "#bb8cfa",
    "--color-secondary-light": "#e5c9ff",
    "--color-tertiary-default": "#ff98cd",
    "--color-tertiary-light": "#ffd2f6",
    "--color-accent-default": "#fbc74a",
    "--color-accent-light": "#fff4b9",
    "--color-grey-default": "#a7a7a7",
    "--color-slate-default": "#58585a",
    "--color-dark-default": "#2f4570",
    "--color-light-default": "#1E1E1E",
    "--color-overlay": "rgba(255, 255, 255, 0.05)",
    
    // Semantic colors - App level  
    "--color-background": "#000000",
    "--color-foreground": "#ffffff",
    "--color-card": "#1a1a1a",
    "--color-border": "#374151",
    
    // Component-specific semantic colors for dark mode
    "--color-button-primary": "#6366f1", // indigo-500 (lighter for dark)
    "--color-button-primary-text": "#ffffff",
    "--color-button-primary-hover": "#818cf8", // indigo-400
    
    "--color-button-secondary": "#6b7280", // gray-500
    "--color-button-secondary-text": "#ffffff", 
    "--color-button-secondary-hover": "#9ca3af", // gray-400
    
    "--color-button-danger": "#ef4444", // red-500 (lighter for dark)
    "--color-button-danger-text": "#ffffff",
    "--color-button-danger-hover": "#f87171", // red-400
    
    "--color-input-background": "#1f2937", // gray-800
    "--color-input-border": "#4b5563", // gray-600
    "--color-input-text": "#f9fafb", // gray-50
    "--color-input-placeholder": "#9ca3af", // gray-400
    
    "--color-text-primary": "#f9fafb", // gray-50
    "--color-text-secondary": "#d1d5db", // gray-300
    "--color-text-muted": "#9ca3af", // gray-400
    
    "--color-surface": "#111827", // gray-900
    "--color-surface-secondary": "#1f2937", // gray-800
    "--color-surface-tertiary": "#374151", // gray-700
  }),
};