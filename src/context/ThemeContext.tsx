'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Theme = 'light' | 'dark';
export type PrimaryColor = 'blue' | 'purple' | 'emerald' | 'rose';
export type FontStyle = 'default' | 'modern' | 'classic' | 'system-sans' | 'system-serif';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (color: PrimaryColor) => void;
  fontStyle: FontStyle;
  setFontStyle: (font: FontStyle) => void;
  isThemeReady: boolean;
}

const defaultThemeContextValue: ThemeContextValue = {
  theme: 'light',
  setTheme: () => console.warn('ThemeProvider not yet ready or mounted'),
  primaryColor: 'blue',
  setPrimaryColor: () => console.warn('ThemeProvider not yet ready or mounted'),
  fontStyle: 'default',
  setFontStyle: () => console.warn('ThemeProvider not yet ready or mounted'),
  isThemeReady: false,
};

const ThemeContext = createContext<ThemeContextValue>(defaultThemeContextValue);

const colorVarMap: Record<PrimaryColor, { light: string; dark: string; foreground: string; ringLight: string; ringDark: string }> = {
  blue: { 
    light: 'var(--primary-blue-hsl)', 
    dark: 'var(--primary-blue-hsl)', // CSS handles dark mode automatically
    foreground: 'var(--primary-blue-foreground-hsl)',
    ringLight: 'var(--ring-blue-hsl)',
    ringDark: 'var(--ring-blue-hsl)' // CSS handles dark mode automatically
  },
  purple: { 
    light: 'var(--primary-purple-hsl)', 
    dark: 'var(--primary-purple-hsl)', // CSS handles dark mode automatically
    foreground: 'var(--primary-purple-foreground-hsl)',
    ringLight: 'var(--ring-purple-hsl)',
    ringDark: 'var(--ring-purple-hsl)' // CSS handles dark mode automatically
  },
  emerald: { 
    light: 'var(--primary-emerald-hsl)', 
    dark: 'var(--primary-emerald-hsl)', // CSS handles dark mode automatically
    foreground: 'var(--primary-emerald-foreground-hsl)',
    ringLight: 'var(--ring-emerald-hsl)',
    ringDark: 'var(--ring-emerald-hsl)' // CSS handles dark mode automatically
  },
  rose: { 
    light: 'var(--primary-rose-hsl)', 
    dark: 'var(--primary-rose-hsl)', // CSS handles dark mode automatically
    foreground: 'var(--primary-rose-foreground-hsl)',
    ringLight: 'var(--ring-rose-hsl)',
    ringDark: 'var(--ring-rose-hsl)' // CSS handles dark mode automatically
  },
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>('blue');
  const [fontStyle, setFontStyleState] = useState<FontStyle>('default');
  const [isThemeReady, setIsThemeReady] = useState(false);

  const applyThemeStyles = useCallback((currentTheme: Theme, currentColor: PrimaryColor) => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(currentTheme);

    // Validate currentColor and provide fallback
    if (!currentColor || !colorVarMap[currentColor]) {
      console.warn(`Invalid primary color: ${currentColor}, falling back to blue`);
      currentColor = 'blue';
    }

    // The CSS variables are already defined in the :root and .dark selectors
    // We just need to set the primary color variables based on the current theme
    const selectedColorSet = colorVarMap[currentColor];
    
    // Set the primary color variables - the CSS will handle dark mode automatically
    // through the .dark selector, so we always use the light values
    root.style.setProperty('--primary', selectedColorSet.light);
    root.style.setProperty('--primary-foreground', selectedColorSet.foreground);
    root.style.setProperty('--ring', selectedColorSet.ringLight);
  }, []);

  const applyFontStyle = useCallback((currentFont: FontStyle) => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    root.classList.remove('font-default', 'font-modern', 'font-classic', 'font-system-sans', 'font-system-serif');
    root.classList.add(`font-${currentFont}`);
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('app-theme') as Theme | null;
    const storedColor = localStorage.getItem('app-primary-color') as PrimaryColor | null;
    const storedFont = localStorage.getItem('app-font-style') as FontStyle | null;
    const initialTheme = storedTheme || 'light';
    const initialColor = storedColor || 'blue';
    const initialFont = storedFont || 'default';

    setThemeState(initialTheme);
    setPrimaryColorState(initialColor);
    setFontStyleState(initialFont);
    applyThemeStyles(initialTheme, initialColor);
    applyFontStyle(initialFont);
    setIsThemeReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional - this should only run once on mount

  const setTheme = (newTheme: Theme) => {
    // Validate the theme before setting it
    if (!newTheme || (newTheme !== 'light' && newTheme !== 'dark')) {
      console.warn(`Invalid theme: ${newTheme}, ignoring change`);
      return;
    }
    
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
    if (isThemeReady) {
      applyThemeStyles(newTheme, primaryColor);
    }
  };

  const setPrimaryColor = (newColor: PrimaryColor) => {
    // Validate the color before setting it
    if (!newColor || !colorVarMap[newColor]) {
      console.warn(`Invalid primary color: ${newColor}, ignoring change`);
      return;
    }
    
    setPrimaryColorState(newColor);
    localStorage.setItem('app-primary-color', newColor);
    if (isThemeReady) {
      applyThemeStyles(theme, newColor);
    }
  };

  const setFontStyle = (newFont: FontStyle) => {
    // Validate the font style before setting it
    const validFontStyles: FontStyle[] = ['default', 'modern', 'classic', 'system-sans', 'system-serif'];
    if (!newFont || !validFontStyles.includes(newFont)) {
      console.warn(`Invalid font style: ${newFont}, ignoring change`);
      return;
    }
    
    setFontStyleState(newFont);
    localStorage.setItem('app-font-style', newFont);
    if (isThemeReady) {
      applyFontStyle(newFont);
    }
  };
  
  const contextValue = { 
    theme, 
    setTheme, 
    primaryColor, 
    setPrimaryColor, 
    fontStyle,
    setFontStyle,
    isThemeReady 
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
   if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
