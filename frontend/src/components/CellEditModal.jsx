import React, { useState } from 'react';
import { X, Calendar, User, Briefcase, CheckCircle2, UserPlus, Zap, ArrowRight, ShieldAlert } from 'lucide-react';

export default function CellEditModal({ 
  cell, 
  employee, 
  brands, 
  allEmployees = [],
  isOpen, 
  onClose, 
  onSave,
  onAssignReplacement
}) {
  if (!isOpen || !cell) return null;

  const [status, setStatus] = useState(cell.status || 'WORKING');
  const [brandId, setBrandId] = useState(cell.brand_id || brands[0]?.id || '');
  const [processType, setProcessType] = useState(cell.process_type || 'CS');
  const [isBackup, setIsBackup] = useState(cell.is_backup || false);
  const [notes, setNotes] = useState(cell.notes || '');

  // Replacement / Cover selection state
  // Filter pod peers who are not this employee
  const podPeers = allEmployees.filter(e => e.pod_id === employee?.pod_id && e.id !== employee?.id);
  const otherPeers = allEmployees.filter(e => e.pod_id !== employee?.pod_id && e.id !== employee?.id);
  const [replacementEmpId, setReplacementEmpId] = useState(podPeers[0]?.id || otherPeers[0]?.id || '');
  const [replacementProcess, setReplacementProcess] = useState(cell.process_type || 'CS');

  const isAbsence = ['PLANNED_LEAVE', 'SICK_LEAVE', 'WEEKLY_OFF'].includes(status);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave({
      date: cell.date,
      employee_id: cell.employee_id,
      status,
      brand_id: status === 'WORKING' ? brandId : null,
      process_type: status === 'WORKING' ? processType : null,
      is_backup: status === 'WORKING' ? isBackup : false,
      notes: notes || `Manual edit by Ops Manager (${status})`
    });
    onClose();
  };

  const handleDeployReplacement = () => {
    if (!replacementEmpId) {
      alert("Please select a colleague to assign as replacement.");
      return;
    }

    const selectedBrand = brands.find(b => b.id === brandId) || brands[0];
    const repEmp = allEmployees.find(e => e.id === replacementEmpId);

    if (onAssignReplacement) {
      onAssignReplacement({
        date: cell.date,
        brand_id: selectedBrand?.id || 'brand-01',
        brand_name: selectedBrand?.name,
        process_type: replacementProcess,
        suggested_employee_id: repEmp?.id,
        suggested_employee_name: repEmp?.name
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0b101d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white">Shift & Coverage Management</h3>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                {cell.date}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Specialist: <strong className="text-slate-200">{employee?.name || cell.employee_name}</strong> ({employee?.pod_id})
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Main Status Selection */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Shift Status for {employee?.name}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="WORKING">WORKING (Active Shift)</option>
                <option value="WEEKLY_OFF">WEEKLY OFF (Scheduled Rest)</option>
                <option value="PLANNED_LEAVE">PLANNED LEAVE</option>
                <option value="SICK_LEAVE">SICK LEAVE (Emergency Medical)</option>
                <option value="COMP_OFF">COMPENSATORY OFF</option>
                <option value="PUBLIC_HOLIDAY_OFF">PUBLIC HOLIDAY OFF</option>
              </select>
            </div>

            {status === 'WORKING' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Brand Assignment
                    </label>
                    <select
                      value={brandId}
                      onChange={(e) => setBrandId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name.split(' (')[0]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Process Focus
                    </label>
                    <select
                      value={processType}
                      onChange={(e) => setProcessType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="CS">Customer Support (CS)</option>
                      <option value="ACC">Abandoned Cart (ACC)</option>
                      <option value="NDR">Non-Delivery Reports (NDR)</option>
                      <option value="RETENTION">Retention & Loyalty</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    id="isBackupCheckbox"
                    checked={isBackup}
                    onChange={(e) => setIsBackup(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isBackupCheckbox" className="text-xs text-slate-300 font-medium cursor-pointer">
                    Flag as <strong className="text-cyan-400 font-bold">Pod Backup</strong> (Covering for a teammate)
                  </label>
                </div>
              </>
            ) : null}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Shift Notes / Reason
              </label>
              <input
                type="text"
                placeholder="e.g. Approved leave / Family wedding"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Update {employee?.name?.split(' ')[0]}'s Status
              </button>
            </div>
          </form>

          {/* DEDICATED ASSIGN REPLACEMENT PANEL (If on leave or off) */}
          {isAbsence && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 bg-gradient-to-br from-cyan-950/20 to-slate-900/50 p-4 rounded-2xl border border-cyan-500/30">
              <div className="flex items-center gap-2 text-xs font-black text-cyan-300 mb-1">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                <span>Assign a Replacement Colleague to Cover {cell.date}</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Since {employee?.name} is {status === 'SICK_LEAVE' ? 'sick' : status === 'WEEKLY_OFF' ? 'on weekly off' : 'on leave'}, deploy another associate from the pod to maintain client SLA coverage.
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Choose Replacement Colleague
                    </label>
                    <select
                      value={replacementEmpId}
                      onChange={(e) => setReplacementEmpId(e.target.value)}
                      className="w-full bg-slate-950 border border-cyan-500/40 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <optgroup label="Same Pod Peers (Recommended)">
                        {podPeers.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.is_pod_lead ? '★ Pod Lead' : ''} ({p.skills.join('/')})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Cross-Pod Associates">
                        {otherPeers.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.pod_id})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Process to Cover
                    </label>
                    <select
                      value={replacementProcess}
                      onChange={(e) => setReplacementProcess(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="CS">Customer Support (CS)</option>
                      <option value="ACC">Abandoned Cart (ACC)</option>
                      <option value="NDR">Non-Delivery Reports (NDR)</option>
                      <option value="RETENTION">Retention</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDeployReplacement}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Deploy Replacement Colleague & Resolve Gap</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">Real-time Neon Database Sync</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
