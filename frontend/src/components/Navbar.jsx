import React, { useState } from 'react';
import { 
  Sparkles, AlertCircle, ShieldCheck, Download, 
  RefreshCw, FlaskConical, Calendar, Users, 
  Layers, ChevronRight, Activity, Palette, Check
} from 'lucide-react';

const BACKGROUND_THEMES = [
  { id: 'obsidian', name: 'Obsidian Solid', icon: '🌌', desc: 'Minimalist deep obsidian dark' },
  { id: 'aurora', name: 'Aurora Glow', icon: '✨', desc: 'Ambient purple & cyan light mesh' },
  { id: 'grid', name: 'Dot Matrix', icon: '📐', desc: 'Subtle technical developer dots' },
  { id: 'blueprint', name: 'Blueprint Grid', icon: '🛰️', desc: 'High-tech operations grid pattern' },
  { id: 'midnight', name: 'Midnight Deep', icon: '🌙', desc: 'Rich indigo & deep navy gradient' },
];

export default function Navbar({ 
  metrics, 
  onRegenerate, 
  onOpenConflicts, 
  onOpenSimulation, 
  onExportCSV,
  isGenerating,
  totalConflicts,
  bgTheme = 'aurora',
  onSelectBgTheme
}) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const criticalCount = metrics?.critical_conflicts || 0;
  const warningCount = metrics?.warning_conflicts || 0;
  const healthPercent = metrics?.coverage_health_percent ?? 92;

  const currentTheme = BACKGROUND_THEMES.find(t => t.id === bgTheme) || BACKGROUND_THEMES[1];

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3">
      <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand identity & System status */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white font-black text-base tracking-wider border border-white/10">
            DS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight">DataStraw</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80 tracking-wide uppercase">
                Smart Roster Engine
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live Solver</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Multi-Brand D2C Operations & Pod Capacity Planning</p>
          </div>
        </div>

        {/* Executive KPI Stats Ribbon */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-900/90 px-4 py-1.5 rounded-xl border border-slate-800 text-xs shadow-inner">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-200">November 2026</span>
          </div>

          <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium">
              <strong className="text-white font-bold">32</strong> Staff • <strong className="text-white font-bold">4</strong> Pods
            </span>
          </div>

          <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
            <span className="text-slate-300 font-medium">
              <strong className="text-white font-bold">16</strong> Brands (<span className="text-amber-400 font-bold">81%</span> Single-Res)
            </span>
          </div>

          {/* SLA Health Indicator */}
          <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
            <ShieldCheck className={`w-4 h-4 ${healthPercent >= 90 ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">SLA Coverage</span>
              <span className="text-xs font-black text-white tabular-nums">{healthPercent}%</span>
            </div>
          </div>

          {/* Conflicts Alert Button */}
          <button 
            onClick={onOpenConflicts}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              criticalCount > 0 
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 hover:bg-rose-500/25 shadow-sm shadow-rose-950' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <div className="text-left leading-tight">
              <span className="text-[10px] uppercase font-bold tracking-wider block">Gaps & Rules</span>
              <span className="text-xs font-bold tabular-nums">
                {criticalCount} Critical {warningCount > 0 && `• ${warningCount} Warn`}
              </span>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Background Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
              title="Change Background Style / Theme"
            >
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTheme.icon} Background</span>
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-[#0c1222] border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 border-b border-slate-800 mb-1">
                  Select Background Style
                </div>
                {BACKGROUND_THEMES.map(theme => {
                  const isSelected = theme.id === bgTheme;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        onSelectBgTheme && onSelectBgTheme(theme.id);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-600/20 text-cyan-300 font-bold border border-cyan-500/40' 
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{theme.icon}</span>
                        <div>
                          <div className="text-xs">{theme.name}</div>
                          <div className="text-[10px] text-slate-400">{theme.desc}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3F What-If Incident Simulator */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-500/40 text-purple-200 font-bold text-xs transition-all shadow-sm shadow-purple-950 cursor-pointer"
            title="Simulate sick leave or unplanned unavailability post-roster generation"
          >
            <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
            <span>Simulate Incident</span>
            <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-700/60 text-[9px] font-black">
              SEC 3F
            </span>
          </button>

          {/* Regenerate Solver */}
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Re-solve</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>
        </div>

      </div>
    </header>
  );
}
