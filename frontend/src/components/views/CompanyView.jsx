import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, CheckCircle2, Shield, AlertCircle, 
  UserCheck, Calendar as CalendarIcon, ArrowUpDown 
} from 'lucide-react';

export default function CompanyView({ 
  cells, 
  employees, 
  pods, 
  brands, 
  onCellClick 
}) {
  const [selectedPod, setSelectedPod] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract total days (1 to 30)
  const days = useMemo(() => {
    const datesSet = new Set(cells.map(c => c.date));
    return Array.from(datesSet).sort();
  }, [cells]);

  // Index cells by employeeId and date
  const cellMap = useMemo(() => {
    const map = new Map();
    cells.forEach(c => {
      map.set(`${c.employee_id}_${c.date}`, c);
    });
    return map;
  }, [cells]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesPod = selectedPod === 'ALL' || emp.pod_id === selectedPod;
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPod && matchesSearch;
    });
  }, [employees, selectedPod, searchQuery]);

  const getPodName = (podId) => {
    const p = pods.find(pod => pod.id === podId);
    return p ? p.name.split(' - ')[0] : podId;
  };

  const getDayDetails = (dateStr) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    const isSunday = dayOfWeek === 'Sun';
    return { dayOfWeek, dayNumber, isSunday };
  };

  const renderBadge = (cell) => {
    if (!cell) return <span className="text-slate-600">-</span>;

    switch (cell.status) {
      case 'WORKING':
        if (cell.is_backup) {
          return (
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 truncate max-w-[85px] text-center" title={`${cell.brand_name || 'Backup'} (${cell.process_type || 'Ops'})`}>
              ⚡ {cell.brand_name ? cell.brand_name.split(' ')[0] : 'Backup'}
            </span>
          );
        }
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 truncate max-w-[85px] text-center" title={`${cell.brand_name || 'Duty'} (${cell.process_type || 'CS'})`}>
            {cell.brand_name ? cell.brand_name.split(' ')[0] : 'Work'}
          </span>
        );
      case 'WEEKLY_OFF':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 text-slate-400">
            OFF
          </span>
        );
      case 'PLANNED_LEAVE':
      case 'SICK_LEAVE':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40" title={cell.notes}>
            {cell.status === 'SICK_LEAVE' ? 'SICK' : 'LEAVE'}
          </span>
        );
      case 'COMP_OFF':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            COMP
          </span>
        );
      case 'PUBLIC_HOLIDAY_OFF':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            HOLIDAY
          </span>
        );
      default:
        return <span className="text-slate-500 text-[10px]">{cell.status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Pod Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search 32 employees by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-72"
            />
          </div>

          {/* Pod Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setSelectedPod('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedPod === 'ALL' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Pods ({employees.length})
            </button>
            {pods.map(pod => (
              <button
                key={pod.id}
                onClick={() => setSelectedPod(pod.id)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedPod === pod.id ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {pod.name.split(' - ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500"></span> Primary Work</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cyan-500/40 border border-cyan-500"></span> Pod Backup</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-700"></span> Weekly Off</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500/50"></span> Leave</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500/50"></span> Holiday</span>
        </div>
      </div>

      {/* Monthly Roster Matrix Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 shadow-2xl max-h-[640px]">
        <table className="w-full text-left border-collapse min-w-[1500px]">
          {/* Header Row: Dates */}
          <thead className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 shadow-md">
            <tr>
              <th className="sticky left-0 z-40 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-200 uppercase tracking-wider w-64 border-r border-slate-800">
                Employee & Pod
              </th>
              {days.map(d => {
                const { dayOfWeek, dayNumber, isSunday } = getDayDetails(d);
                return (
                  <th 
                    key={d} 
                    className={`px-2 py-2 text-center text-xs font-bold border-r border-slate-800/80 min-w-[70px] ${
                      isSunday ? 'bg-slate-950/90 text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">{dayOfWeek}</div>
                    <div className="text-xs font-black">{dayNumber}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-900/40 transition-colors group">
                {/* Fixed Left Column: Employee Identity */}
                <td className="sticky left-0 z-20 bg-slate-950 group-hover:bg-slate-900 px-4 py-2.5 border-r border-slate-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        {emp.name}
                        {emp.is_pod_lead && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/60 text-[9px] font-black uppercase tracking-wider">
                            Lead
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {getPodName(emp.pod_id)} • {emp.skills.join('/')}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Date Columns */}
                {days.map(d => {
                  const cell = cellMap.get(`${emp.id}_${d}`);
                  const { isSunday } = getDayDetails(d);
                  return (
                    <td 
                      key={d} 
                      onClick={() => onCellClick && onCellClick(cell, emp)}
                      className={`px-1 py-1.5 text-center border-r border-slate-800/50 cursor-pointer hover:bg-slate-800/60 transition-colors ${
                        isSunday ? 'bg-slate-950/30' : ''
                      }`}
                    >
                      {renderBadge(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
