// utils/color-theme.ts - Enhanced with semantic colors
import { vars } from "nativewind";

export const themes = {
  light: vars({
    // Brand colors
    "--color-primary-default": "#6366f1",
    "--color-grey-default": "#f3f4f6",
    "--color-dark-default": "#1f355b",
    "--color-white": "#ffffff",
    
    // Semantic colors - App level
    "--color-background": "#f3f4f6",
    "--color-foreground": "#000000",
    "--color-card": "#f8f9fa",
    "--color-border": "#e5e7eb",
    
    // Component-specific semantic colors
    "--color-button-primary": "#6366f1", // indigo-600
    "--color-button-primary-text": "#ffffff",
    "--color-button-primary-hover": "#4338ca", // indigo-700
    
  
    
    "--color-input-background": "#e5e7eb",
    "--color-input-placeholder": "#888", // gray-500
    
    "--color-text-primary": "#111827", // gray-900
    "--color-text-secondary": "#000000", // gray-500
    "--color-text-muted": "#9ca3af", // gray-400
    
 
  }),
  
  dark: vars({
    // Brand colors (slightly adjusted for dark mode)
      "--color-primary-default": "#6366f1",
    "--color-grey-default": "#f3f4f6",
    "--color-dark-default": "#1f355b",
    "--color-white": "#ffffff",
    
    // Semantic colors - App level  
    "--color-background": "#000000",
    "--color-foreground": "#ffffff",
    "--color-card": "#1a1a1a",
    "--color-border": "#374151",
    
    // Component-specific semantic colors for dark mode
    "--color-button-primary": "#6366f1", // indigo-500 (lighter for dark)
    "--color-button-primary-text": "#ffffff",
    "--color-button-primary-hover": "#818cf8", // indigo-400
    
   
    "--color-input-background": "#1f2937", // gray-800
    "--color-input-placeholder": "#9ca3af", // gray-400
    
    "--color-text-primary": "#f9fafb", // gray-50
    "--color-text-secondary": "#d1d5db", // gray-300
    "--color-text-muted": "#9ca3af", // gray-400
    
    "--color-surface": "#111827", // gray-900
    "--color-surface-secondary": "#1f2937", // gray-800
    "--color-surface-tertiary": "#374151", // gray-700
  }),
};