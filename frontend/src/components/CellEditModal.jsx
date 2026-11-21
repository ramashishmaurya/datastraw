import React, { useState } from 'react';
import { X, Calendar, User, Briefcase, CheckCircle2 } from 'lucide-react';

export default function CellEditModal({ 
  cell, 
  employee, 
  brands, 
  isOpen, 
  onClose, 
  onSave 
}) {
  if (!isOpen || !cell) return null;

  const [status, setStatus] = useState(cell.status || 'WORKING');
  const [brandId, setBrandId] = useState(cell.brand_id || brands[0]?.id || '');
  const [processType, setProcessType] = useState(cell.process_type || 'CS');
  const [isBackup, setIsBackup] = useState(cell.is_backup || false);
  const [notes, setNotes] = useState(cell.notes || '');

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <h3 className="text-sm font-extrabold text-white">Edit Shift Assignment</h3>
            <p className="text-xs text-slate-400">
              {employee?.name || cell.employee_name} • {cell.date}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Shift Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="WORKING">WORKING (Active Shift)</option>
              <option value="WEEKLY_OFF">WEEKLY OFF (Scheduled Rest)</option>
              <option value="PLANNED_LEAVE">PLANNED LEAVE</option>
              <option value="SICK_LEAVE">SICK LEAVE</option>
              <option value="COMP_OFF">COMPENSATORY OFF</option>
              <option value="PUBLIC_HOLIDAY_OFF">PUBLIC HOLIDAY OFF</option>
            </select>
          </div>

          {status === 'WORKING' && (
            <>
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
                      {b.name} ({b.operating_model})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Process Management
                </label>
                <select
                  value={processType}
                  onChange={(e) => setProcessType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="CS">CS (Customer Support)</option>
                  <option value="ACC">ACC (Abandoned Cart Conversions)</option>
                  <option value="NDR">NDR (Non-Delivery Reports)</option>
                  <option value="RETENTION">RETENTION (Customer Retention)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isBackupCheckbox"
                  checked={isBackup}
                  onChange={(e) => setIsBackup(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-800 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isBackupCheckbox" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Deploy as <span className="text-cyan-400 font-bold">Pod Backup</span> for this brand
                </label>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Shift Notes / Reason
            </label>
            <input
              type="text"
              placeholder="e.g. Approved leave / Covering emergency gap"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
            >
              Save & Recalculate SLA
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
