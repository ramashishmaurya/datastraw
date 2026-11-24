import React from 'react';
import { 
  Sparkles, AlertCircle, ShieldCheck, Download, 
  RefreshCw, FlaskConical, Calendar, Users, 
  Layers, ChevronRight, Activity, Sun, Moon
} from 'lucide-react';

export default function Navbar({ 
  metrics, 
  onRegenerate, 
  onOpenConflicts, 
  onOpenSimulation, 
  onExportCSV,
  isGenerating,
  totalConflicts,
  theme = 'dark',
  onToggleTheme
}) {
  const criticalCount = metrics?.critical_conflicts || 0;
  const warningCount = metrics?.warning_conflicts || 0;
  const healthPercent = metrics?.coverage_health_percent ?? 92;

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 py-2.5 sm:py-3">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand identity & System status */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white font-black text-sm sm:text-base tracking-wider border border-white/10 shrink-0">
            DS
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">DataStraw</span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80 tracking-wide uppercase">
                Roster
              </span>
              <div className="hidden xs:flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live</span>
              </div>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-medium truncate">
              Multi-Brand D2C Operations & Pod Capacity Planning
            </p>
          </div>
        </div>

        {/* Executive KPI Stats Ribbon (Desktop & Tablets) */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-900/90 px-4 py-1.5 rounded-xl border border-slate-800 text-xs shadow-inner shrink-0">
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
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Mobile-Only Conflicts Badge Button */}
          <button 
            onClick={onOpenConflicts}
            className={`lg:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
              criticalCount > 0 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50' 
                : 'bg-slate-900 border border-slate-700 text-slate-300'
            }`}
            title="Open Conflict Audit Drawer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span className="tabular-nums font-mono text-[11px] sm:text-xs">{criticalCount}</span>
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-xs transition-all cursor-pointer shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Section 3F What-If Incident Simulator */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-500/40 text-purple-200 font-bold text-xs transition-all shadow-sm shadow-purple-950 cursor-pointer"
            title="Simulate sick leave or unplanned unavailability post-roster generation"
          >
            <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Simulate Incident</span>
            <span className="sm:hidden">Simulate</span>
            <span className="hidden md:inline px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-700/60 text-[9px] font-black">
              SEC 3F
            </span>
          </button>

          {/* Regenerate Solver */}
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
            title="Re-run deterministic constraint solver"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Re-solve</span>
            <span className="sm:hidden">Solve</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
            title="Export full roster to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

      </div>
    </header>
  );
}
