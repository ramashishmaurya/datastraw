import React, { useState, useMemo } from 'react';
import { 
  User, Mail, Shield, Award, Calendar, CheckCircle, 
  AlertCircle, Briefcase, Zap, HeartPulse 
} from 'lucide-react';

export default function EmployeeView({ employees, pods, brands, cells, onCellClick }) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'emp-01');

  const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
  const pod = pods.find(p => p.id === selectedEmp?.pod_id);

  // Filter cells for this employee
  const empCells = useMemo(() => {
    return cells.filter(c => c.employee_id === selectedEmp?.id).sort((a, b) => a.date.localeCompare(b.date));
  }, [cells, selectedEmp]);

  // Statistics
  const workingCount = empCells.filter(c => c.status === 'WORKING').length;
  const offCount = empCells.filter(c => c.status === 'WEEKLY_OFF').length;
  const leaveCount = empCells.filter(c => ['PLANNED_LEAVE', 'SICK_LEAVE'].includes(c.status)).length;
  const holidayCount = empCells.filter(c => c.status === 'PUBLIC_HOLIDAY_OFF').length;

  // Calculate max consecutive work streak
  let maxStreak = 0;
  let currentStreak = 0;
  empCells.forEach(c => {
    if (c.status === 'WORKING') {
      currentStreak += 1;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Employee Quick Selector Bar */}
      <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300">Select Employee Profile:</span>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.pod_id}) {emp.is_pod_lead ? '★ Pod Lead' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Viewing schedule for <span className="text-white font-bold">{selectedEmp.name}</span>
        </div>
      </div>

      {/* Employee Profile & Workload Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-cyan-600/30">
            {selectedEmp.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">{selectedEmp.name}</h3>
              {selectedEmp.is_pod_lead && (
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-black uppercase">
                  Pod Lead
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{selectedEmp.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold mt-1">
              <Shield className="w-3.5 h-3.5" />
              <span>{pod?.name || selectedEmp.pod_id}</span>
            </div>
          </div>
        </div>

        {/* Skills & Preferences */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-400" />
            Certifications & Preferences
          </div>
          <div className="text-xs text-slate-300 space-y-2">
            <div>
              <span className="text-slate-400 text-[11px] block">Process Skills:</span>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {selectedEmp.skills.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-slate-950 text-cyan-300 border border-slate-800 text-[11px] font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              Weekly Off Preference: <span className="text-white font-semibold">{selectedEmp.weekly_off_preference === 0 ? 'Sunday' : `Day ${selectedEmp.weekly_off_preference}`}</span>
            </div>
          </div>
        </div>

        {/* Fatigue & Health Compliance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-emerald-400" />
            Fatigue & Monthly Breakdown
          </div>
          <div className="grid grid-cols-4 gap-2 text-center mt-3">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-sm font-black text-emerald-400">{workingCount}</div>
              <div className="text-[9px] text-slate-400 uppercase font-semibold">Work</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-sm font-black text-slate-300">{offCount}</div>
              <div className="text-[9px] text-slate-400 uppercase font-semibold">Offs</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-sm font-black text-rose-400">{leaveCount}</div>
              <div className="text-[9px] text-slate-400 uppercase font-semibold">Leaves</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-sm font-black text-indigo-400">{holidayCount}</div>
              <div className="text-[9px] text-slate-400 uppercase font-semibold">Holiday</div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Max Work Streak: <b className="text-white">{maxStreak} days</b></span>
            <span className={maxStreak <= 6 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {maxStreak <= 6 ? '✓ Fatigue Compliant' : '⚠ High Fatigue'}
            </span>
          </div>
        </div>
      </div>

      {/* Individual Monthly Calendar Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          November 2026 Shift Schedule for {selectedEmp.name}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 sm:gap-3">
          {empCells.map(c => {
            const dt = new Date(c.date);
            const dayNum = dt.getDate();
            const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' });
            const isSunday = dayName === 'Sun';

            let cardBg = 'bg-slate-950 border-slate-800 text-slate-400';
            let badgeText = c.status;
            let badgeColor = 'bg-slate-800 text-slate-300';

            if (c.status === 'WORKING') {
              cardBg = c.is_backup 
                ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200' 
                : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200';
              badgeText = c.is_backup ? 'POD BACKUP' : 'WORKING';
              badgeColor = c.is_backup ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300';
            } else if (c.status === 'WEEKLY_OFF') {
              cardBg = 'bg-slate-900/60 border-slate-800 text-slate-400';
              badgeText = 'WEEKLY OFF';
              badgeColor = 'bg-slate-800 text-slate-400';
            } else if (['PLANNED_LEAVE', 'SICK_LEAVE'].includes(c.status)) {
              cardBg = 'bg-rose-950/30 border-rose-500/40 text-rose-200';
              badgeText = c.status === 'SICK_LEAVE' ? 'SICK LEAVE' : 'PLANNED LEAVE';
              badgeColor = 'bg-rose-500/20 text-rose-300';
            } else if (c.status === 'PUBLIC_HOLIDAY_OFF') {
              cardBg = 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200';
              badgeText = 'HOLIDAY OFF';
              badgeColor = 'bg-indigo-500/20 text-indigo-300';
            }

            return (
              <div
                key={c.date}
                onClick={() => onCellClick && onCellClick(c, selectedEmp)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${cardBg}`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`font-bold ${isSunday ? 'text-amber-400' : 'text-slate-400'}`}>
                    {dayName}, Nov {dayNum}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
                    {badgeText}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {c.brand_name || (c.status === 'WORKING' ? 'Pod Assignment' : 'Off-Duty')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {c.process_type ? `Process: ${c.process_type}` : c.notes || 'Normal Day'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
