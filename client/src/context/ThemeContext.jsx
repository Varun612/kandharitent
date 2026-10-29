import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'royal-obsidian',
    name: 'Royal Obsidian',
    label: 'Obsidian & Gold',
    description: 'Deep royal plum and imperial champagne gold (Night Luxury)',
    badgeColor: 'bg-purple-950 text-amber-300 border-amber-500/40',
    swatch: 'from-[#0A0314] via-[#1A072B] to-[#C5A059]',
    icon: 'Moon'
  },
  {
    id: 'imperial-ivory',
    name: 'Imperial Ivory',
    label: 'Ivory & Burgundy',
    description: 'Royal daylight Awadhi cream with velvet burgundy accents',
    badgeColor: 'bg-stone-100 text-stone-900 border-amber-600/40',
    swatch: 'from-[#FAF7F2] via-[#F3EDE2] to-[#8C1D40]',
    icon: 'Sun'
  },
  {
    id: 'emerald-palace',
    name: 'Emerald Palace',
    label: 'Emerald & Gold',
    description: 'Lush botanical garden lawn with sparkling champagne gold',
    badgeColor: 'bg-emerald-950 text-emerald-200 border-amber-400/40',
    swatch: 'from-[#041611] via-[#0A2E23] to-[#D4AF37]',
    icon: 'Sparkles'
  }
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kandhari_color_theme') || 'royal-obsidian';
    }
    return 'royal-obsidian';
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kandhari_color_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const activeThemeMeta = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, activeThemeMeta }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
