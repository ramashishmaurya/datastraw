import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, Zap, ArrowRight, Filter, ShieldCheck, UserPlus, ChevronDown } from 'lucide-react';

export default function ConflictDrawer({ 
  isOpen, 
  onClose, 
  conflicts, 
  allEmployees = [],
  onApplyFix,
  isResolving 
}) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [customAssignOpen, setCustomAssignOpen] = useState({}); // { [confId]: true/false }
  const [customSelectedEmp, setCustomSelectedEmp] = useState({}); // { [confId]: empId }

  if (!isOpen) return null;

  const filteredConflicts = conflicts.filter(c => {
    if (filterSeverity === 'CRITICAL') return c.severity === 'CRITICAL';
    if (filterSeverity === 'WARNING') return c.severity === 'WARNING';
    return true;
  });

  const criticalCount = conflicts.filter(c => c.severity === 'CRITICAL').length;
  const warningCount = conflicts.filter(c => c.severity === 'WARNING').length;

  const toggleCustomAssign = (confId) => {
    setCustomAssignOpen(prev => ({ ...prev, [confId]: !prev[confId] }));
  };

  const handleCustomDeploy = (conf) => {
    const chosenEmpId = customSelectedEmp[conf.id] || conf.suggested_employee_id || allEmployees[0]?.id;
    const chosenEmp = allEmployees.find(e => e.id === chosenEmpId);

    if (onApplyFix && chosenEmp) {
      onApplyFix({
        ...conf,
        suggested_employee_id: chosenEmp.id,
        suggested_employee_name: chosenEmp.name
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0a0f1d] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold shadow-md shadow-rose-950">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Operational Conflict Audit</h3>
              <p className="text-xs text-slate-400">
                {criticalCount} Critical SLA Gaps • {warningCount} Fatigue Warnings
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold mr-1">Filter Severity:</span>
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterSeverity === 'ALL' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({conflicts.length})
          </button>
          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterSeverity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-rose-400 hover:bg-slate-800'
            }`}
          >
            Critical Gaps ({criticalCount})
          </button>
          <button
            onClick={() => setFilterSeverity('WARNING')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterSeverity === 'WARNING' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
            }`}
          >
            Warnings ({warningCount})
          </button>
        </div>

        {/* Conflicts List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {filteredConflicts.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-bold text-slate-300">All Constraints Fully Satisfied!</p>
              <p className="text-xs text-slate-500 mt-1">No SLA gaps or labour rule breaches detected in this filter.</p>
            </div>
          ) : (
            filteredConflicts.map(conf => {
              const isCritical = conf.severity === 'CRITICAL';
              const isCustomOpen = Boolean(customAssignOpen[conf.id]);

              return (
                <div 
                  key={conf.id} 
                  className={`p-4 rounded-2xl border transition-all ${
                    isCritical 
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-sm shadow-rose-950/30' 
                      : 'bg-amber-950/20 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        isCritical ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                      }`}>
                        {conf.conflict_type}
                      </span>
                      <span className="text-slate-300 font-mono">{conf.date}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[160px]">
                      {conf.brand_name || conf.employee_name}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium mb-3 leading-relaxed">
                    {conf.message}
                  </p>

                  {/* Recommendation Box */}
                  {conf.suggested_fix && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-3 text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" /> Resolution Proposal
                      </div>
                      <div className="text-slate-300 text-xs">
                        {conf.suggested_fix}
                      </div>
                    </div>
                  )}

                  {/* 1-Click Action Buttons */}
                  {conf.brand_id && (
                    <div className="space-y-2">
                      {conf.suggested_employee_id && (
                        <button
                          onClick={() => onApplyFix && onApplyFix(conf)}
                          disabled={isResolving}
                          className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Deploy {conf.suggested_employee_name || 'Recommended Backup'} (1-Click Fix)</span>
                        </button>
                      )}

                      {/* Custom Replacement Colleague Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleCustomAssign(conf.id)}
                        className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-semibold mx-auto transition-colors cursor-pointer pt-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>{isCustomOpen ? 'Hide Manual Colleague Picker' : 'Or Assign a Different Colleague Manually'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isCustomOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isCustomOpen && (
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 animate-in fade-in duration-150">
                          <label className="block text-[10px] font-bold uppercase text-slate-400">
                            Select Any Colleague to Cover This Shift:
                          </label>
                          <select
                            value={customSelectedEmp[conf.id] || conf.suggested_employee_id || allEmployees[0]?.id}
                            onChange={(e) => setCustomSelectedEmp(prev => ({ ...prev, [conf.id]: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-400"
                          >
                            {allEmployees.map(e => (
                              <option key={e.id} value={e.id}>
                                {e.name} ({e.pod_id}) {e.is_pod_lead ? '★ Pod Lead' : ''}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleCustomDeploy(conf)}
                            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Confirm & Assign Selected Colleague
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 text-xs text-slate-400 flex items-center justify-between">
          <span className="font-mono text-[11px]">Rule Engine: 100% Deterministic CSP</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
}
