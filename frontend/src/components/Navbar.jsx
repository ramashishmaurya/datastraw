import React from 'react';
import { 
  Sparkles, AlertTriangle, ShieldCheck, 
  Download, RefreshCw, FlaskConical, Layers,
  Calendar, CheckCircle, Users
} from 'lucide-react';

export default function Navbar({ 
  metrics, 
  onRegenerate, 
  onOpenConflicts, 
  onOpenSimulation, 
  onExportCSV,
  isGenerating,
  totalConflicts
}) {
  const criticalCount = metrics?.critical_conflicts || 0;
  const warningCount = metrics?.warning_conflicts || 0;
  const healthPercent = metrics?.coverage_health_percent ?? 92;

  return (
    <header className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand and System Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl tracking-wider">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-lg tracking-tight">DataStraw</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                OPS ROSTER v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Smart Multi-Brand Scheduling & Pod Capacity Engine</p>
          </div>
        </div>

        {/* Operational Health Metrics Bar */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-200">Nov 2026</span>
          </div>

          <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
            <ShieldCheck className={`w-4 h-4 ${healthPercent > 80 ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">SLA Health</div>
              <div className="text-xs font-bold text-white">{healthPercent}%</div>
            </div>
          </div>

          <button 
            onClick={onOpenConflicts}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg transition-all ${
              criticalCount > 0 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 animate-pulse' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-semibold">Conflicts</div>
              <div className="text-xs font-bold">{criticalCount} Critical {warningCount > 0 && `• ${warningCount} Warn`}</div>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Simulate Change Button (Section 3F highlight) */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/40 text-purple-300 font-semibold text-xs transition-all shadow-sm shadow-purple-500/10 cursor-pointer"
            title="Simulate sick leave or change in availability"
          >
            <FlaskConical className="w-4 h-4 text-purple-400" />
            <span>Simulate Change</span>
          </button>

          {/* Regenerate Button */}
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

      </div>
    </header>
  );
}
