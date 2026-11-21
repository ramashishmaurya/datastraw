import React, { useState, useMemo } from 'react';
import { 
  Briefcase, CheckCircle2, AlertTriangle, ShieldAlert, 
  ShieldCheck, Clock, ArrowRight, UserCheck 
} from 'lucide-react';

export default function BrandView({ brands, allocations, employees, cells, conflicts, onResolveConflict }) {
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || 'brand-01');

  const selectedBrand = brands.find(b => b.id === selectedBrandId) || brands[0];

  // Assigned employees for this brand
  const assignedAllocs = allocations.filter(a => a.brand_id === selectedBrand?.id);
  const assignedEmpIds = Array.from(new Set(assignedAllocs.map(a => a.employee_id)));
  const assignedEmployees = employees.filter(e => assignedEmpIds.includes(e.id));

  // Extract total days (1 to 30)
  const days = useMemo(() => {
    const datesSet = new Set(cells.map(c => c.date));
    return Array.from(datesSet).sort();
  }, [cells]);

  // Brand conflicts
  const brandConflicts = conflicts.filter(c => c.brand_id === selectedBrand?.id);

  // Calculate day-by-day coverage status
  const dailyCoverage = useMemo(() => {
    return days.map(dateStr => {
      // Find working employees on this brand for this date
      const activeWorkers = cells.filter(
        c => c.date === dateStr && c.brand_id === selectedBrand?.id && c.status === 'WORKING'
      );
      // Check if there is a conflict flagged for this brand on this date
      const dateConflicts = brandConflicts.filter(c => c.date === dateStr);
      const hasCriticalGap = dateConflicts.some(c => c.severity === 'CRITICAL');
      const hasWarning = dateConflicts.some(c => c.severity === 'WARNING');

      const dt = new Date(dateStr);
      const isSunday = dt.getDay() === 0;
      const dayNum = dt.getDate();

      return {
        dateStr,
        dayNum,
        isSunday,
        activeCount: activeWorkers.length,
        activeWorkers,
        hasCriticalGap,
        hasWarning,
        conflicts: dateConflicts
      };
    });
  }, [days, cells, selectedBrand, brandConflicts]);

  return (
    <div className="space-y-6">
      {/* Brand Selection Scroll/Grid */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {brands.map(b => {
          const isSelected = b.id === selectedBrandId;
          const confCount = conflicts.filter(c => c.brand_id === b.id && c.severity === 'CRITICAL').length;

          return (
            <button
              key={b.id}
              onClick={() => setSelectedBrandId(b.id)}
              className={`px-3.5 py-2.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold truncate max-w-[150px]">{b.name}</span>
                {confCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                    {confCount}
                  </span>
                )}
              </div>
              <div className="text-[10px] opacity-80">
                {b.is_single_resource ? 'Single Resource' : 'Multi-Staff'} • {b.operating_model}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Brand Dashboard */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white">{selectedBrand.name}</h2>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                selectedBrand.is_single_resource 
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                  : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
              }`}>
                {selectedBrand.is_single_resource ? 'Dedicated Single-Resource (80% Class)' : 'Multi-Resource Team'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Operating Calendar: <span className="font-semibold text-slate-200">{selectedBrand.operating_model}</span> • Pod: <span className="font-semibold text-cyan-400">{selectedBrand.pod_id}</span>
            </p>
          </div>

          {/* Assigned Staff Summary */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Assigned Team:</span>
            {assignedEmployees.map(emp => (
              <span key={emp.id} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-cyan-400" /> {emp.name}
              </span>
            ))}
          </div>
        </div>

        {/* Process Requirements Breakdown */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Process SLA & Staffing Requirements</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {selectedBrand.process_requirements.map(req => (
              <div key={req.process_type} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span>{req.process_type} Management</span>
                  <span className="text-cyan-400">Min: {req.min_staff} Headcount</span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>Operates Sundays: <span className={req.operates_sundays ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{req.operates_sundays ? 'Yes (365)' : 'No (Closed)'}</span></div>
                  <div>Operates Holidays: <span className={req.operates_holidays ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{req.operates_holidays ? 'Yes' : 'No (Public Off)'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 30-Day Daily Coverage Visual Grid */}
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Daily 30-Day SLA Coverage Status</span>
          <div className="flex items-center gap-3 font-normal normal-case text-[11px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Covered</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500 animate-pulse"></span> Coverage Gap</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-800"></span> Policy Closed</span>
          </div>
        </h4>

        <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-2">
          {dailyCoverage.map(day => {
            const isCovered = day.activeCount > 0 && !day.hasCriticalGap;
            const isGap = day.hasCriticalGap;

            return (
              <div
                key={day.dateStr}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isGap 
                    ? 'bg-rose-950/40 border-rose-500/80 text-rose-300 shadow-sm shadow-rose-900/50' 
                    : isCovered
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-[10px] uppercase font-semibold text-slate-400">Nov {day.dayNum}</div>
                <div className="my-1.5 flex justify-center">
                  {isGap ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                  ) : isCovered ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div className="text-[10px] font-bold">
                  {isGap ? '0 Staff Gap' : isCovered ? `${day.activeCount} Active` : 'Closed'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Conflicts for this Brand */}
        {brandConflicts.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Actionable Coverage Alerts for {selectedBrand.name} ({brandConflicts.length})
            </h4>
            <div className="space-y-2">
              {brandConflicts.map(conf => (
                <div key={conf.id} className="bg-rose-950/20 border border-rose-500/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-rose-900 text-rose-200 text-[10px]">
                        {conf.date}
                      </span>
                      <span>{conf.message}</span>
                    </div>
                    {conf.suggested_fix && (
                      <div className="text-[11px] text-cyan-300 mt-1">
                        💡 <span className="font-semibold">Suggested Fix:</span> {conf.suggested_fix}
                      </div>
                    )}
                  </div>

                  {conf.suggested_employee_id && (
                    <button
                      onClick={() => onResolveConflict && onResolveConflict(conf)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Deploy Suggested Backup
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
