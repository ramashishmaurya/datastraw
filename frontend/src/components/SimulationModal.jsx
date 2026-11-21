import React, { useState } from 'react';
import { 
  X, FlaskConical, AlertTriangle, CheckCircle2, 
  ArrowRight, ShieldCheck, Zap, User, Calendar 
} from 'lucide-react';
import { simulateChange } from '../api';

export default function SimulationModal({ 
  isOpen, 
  onClose, 
  employees, 
  onApplySimulationToLive 
}) {
  const [employeeId, setEmployeeId] = useState(employees[1]?.id || 'emp-02'); // Defaults to Aarav Patel (single-resource)
  const [simDate, setSimDate] = useState('2026-11-18');
  const [actionType, setActionType] = useState('MARK_SICK_LEAVE');
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const res = await simulateChange({
        employee_id: employeeId,
        date: simDate,
        action: actionType,
        leave_type: actionType === 'MARK_SICK_LEAVE' ? 'SICK_LEAVE' : 'PLANNED_LEAVE'
      });
      setSimulationResult(res);
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyToLiveRoster = () => {
    if (simulationResult && onApplySimulationToLive) {
      onApplySimulationToLive({
        employee_id: employeeId,
        date: simDate,
        status: actionType === 'MARK_SICK_LEAVE' ? 'SICK_LEAVE' : 'PLANNED_LEAVE',
        notes: `Simulated Emergency Absence (${actionType})`
      });
      onClose();
    }
  };

  const selectedEmployee = employees.find(e => e.id === employeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 transition-all">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Live "What-If" Change Simulator</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                  SECTION 3F
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulate post-generation leave requests or capacity disruptions.
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

        {/* Configuration Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Employee Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Associate
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.pod_id})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Simulation Date
              </label>
              <input
                type="date"
                value={simDate}
                min="2026-11-01"
                max="2026-11-30"
                onChange={(e) => setSimDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
              />
            </div>

            {/* Action Type */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Unavailability Event
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="MARK_SICK_LEAVE">Emergency Sick Leave</option>
                <option value="MARK_PLANNED_LEAVE">Planned Leave Request</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/30 cursor-pointer disabled:opacity-50"
          >
            <FlaskConical className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Running Impact Evaluation...' : 'Simulate Availability Change'}</span>
          </button>

          {/* Simulation Results Display */}
          {simulationResult && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3.5 animate-in fade-in duration-200">
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <div className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Impact Summary
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {simulationResult.summary}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Impacted Brand(s):</span>
                  {simulationResult.impacted_brands.map(bName => (
                    <span key={bName} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold">
                      {bName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detected Gaps */}
              {simulationResult.new_conflicts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Resulting Coverage Gap ({simulationResult.new_conflicts.length})
                  </h4>
                  <div className="space-y-2">
                    {simulationResult.new_conflicts.map((conf, idx) => (
                      <div key={idx} className="bg-rose-950/25 border border-rose-500/40 p-3 rounded-xl text-xs text-rose-200 font-medium">
                        {conf.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Algorithmic Backup Proposals */}
              {simulationResult.backup_recommendations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    Pod Backup Resolution Recommendations
                  </h4>
                  <div className="space-y-2">
                    {simulationResult.backup_recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-cyan-500/30 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{rec.brand_name} [{rec.process_type}]</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span className="text-cyan-300">{rec.recommended_employee_name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{rec.rationale}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
          >
            Cancel
          </button>

          {simulationResult && (
            <button
              onClick={handleApplyToLiveRoster}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-rose-600/30 cursor-pointer"
            >
              <span>Apply Absence to Live Roster</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
