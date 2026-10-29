import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, Moon, Sun, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeSwitcher = ({ variant = 'navbar' }) => {
  const { theme, setTheme, themes, activeThemeMeta } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getThemeIcon = (iconName) => {
    switch (iconName) {
      case 'Sun': return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'Sparkles': return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Moon':
      default: return <Moon className="w-3.5 h-3.5 text-amber-300" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-amber-500/30 text-xs font-semibold transition shadow-sm cursor-pointer"
        title="Switch Palace Palette"
        aria-label="Switch Theme Palette"
      >
        <Palette className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline text-[11px] font-serif">{activeThemeMeta.label}</span>
        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${activeThemeMeta.swatch} border border-amber-400/50 shrink-0`} />
        <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#120722] border border-amber-500/40 shadow-2xl p-2 z-50 animate-fade-in">
          <div className="px-3 py-1.5 border-b border-amber-500/20 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Palace Atmosphere Palette</span>
            </span>
          </div>

          <div className="space-y-1">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${
                  theme === t.id
                    ? 'bg-amber-500/15 border border-amber-400/50 text-white shadow-sm'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${t.swatch} border border-amber-300/40 shrink-0 shadow-sm flex items-center justify-center`}>
                    {theme === t.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-serif font-bold text-stone-100">{t.name}</span>
                      {getThemeIcon(t.icon)}
                    </div>
                    <p className="text-[10px] text-stone-400 line-clamp-1">{t.description}</p>
                  </div>
                </div>

                {theme === t.id && (
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
