import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, CheckCircle2, Shield, AlertCircle, 
  UserCheck, Calendar as CalendarIcon, ArrowUpDown, 
  Crown, Layers, Eye, Users, ChevronDown, ChevronRight
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
  const [groupByPod, setGroupByPod] = useState(true);
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, WORKING, LEAVES, CONFLICTS

  // Extract all 30 dates in November 2026
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

  // Public holidays map for November 2026
  const holidayMap = {
    '2026-11-08': 'Diwali',
    '2026-11-24': 'Guru Nanak Jayanti'
  };

  // Filter employees based on search, pod filter, and status filter
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesPod = selectedPod === 'ALL' || emp.pod_id === selectedPod;
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesPod || !matchesSearch) return false;

      if (filterMode === 'LEAVES') {
        const empCells = cells.filter(c => c.employee_id === emp.id);
        return empCells.some(c => ['PLANNED_LEAVE', 'SICK_LEAVE'].includes(c.status));
      }
      return true;
    });
  }, [employees, cells, selectedPod, searchQuery, filterMode]);

  // Group filtered employees by Pod
  const podGroups = useMemo(() => {
    const groups = {};
    pods.forEach(p => {
      groups[p.id] = {
        pod: p,
        employees: filteredEmployees.filter(e => e.pod_id === p.id)
      };
    });
    return groups;
  }, [pods, filteredEmployees]);

  const getDayDetails = (dateStr) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'narrow' });
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    const isSunday = dayName === 'Sun';
    const isSaturday = dayName === 'Sat';
    const isHoliday = dateStr in holidayMap;
    return { dayOfWeek, dayName, dayNumber, isSunday, isSaturday, isHoliday, holidayName: holidayMap[dateStr] };
  };

  // Daily active staff aggregation row
  const dailyActiveCount = useMemo(() => {
    return days.map(d => {
      const active = cells.filter(c => c.date === d && c.status === 'WORKING');
      return { date: d, count: active.length };
    });
  }, [days, cells]);

  const renderBadge = (cell) => {
    if (!cell) return <span className="text-slate-700">-</span>;

    switch (cell.status) {
      case 'WORKING':
        if (cell.is_backup) {
          return (
            <span 
              className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 truncate max-w-[85px] shadow-sm hover:scale-105 transition-transform" 
              title={`Deployed as Pod Backup for ${cell.brand_name || 'Brand'} [${cell.process_type || 'Ops'}]`}
            >
              ⚡ {cell.brand_name ? cell.brand_name.split(' ')[0] : 'Backup'}
            </span>
          );
        }
        return (
          <span 
            className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 truncate max-w-[85px] hover:border-emerald-400/60 transition-colors" 
            title={`${cell.brand_name || 'Assigned Duty'} [${cell.process_type || 'Primary'}]`}
          >
            {cell.brand_name ? cell.brand_name.split(' ')[0] : 'Work'}
          </span>
        );
      case 'WEEKLY_OFF':
        return (
          <span className="inline-block px-1 py-0.5 rounded text-[9px] font-medium text-slate-500 hover:text-slate-300 transition-colors">
            OFF
          </span>
        );
      case 'PLANNED_LEAVE':
      case 'SICK_LEAVE':
        return (
          <span 
            className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-sm" 
            title={cell.notes || 'Unavailability record'}
          >
            {cell.status === 'SICK_LEAVE' ? 'SICK' : 'LEAVE'}
          </span>
        );
      case 'COMP_OFF':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/70 text-amber-300 border border-amber-500/40">
            COMP
          </span>
        );
      case 'PUBLIC_HOLIDAY_OFF':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-500/30" title={cell.notes}>
            HOLIDAY
          </span>
        );
      default:
        return <span className="text-slate-600 text-[10px]">{cell.status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Ops Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-2xl border border-slate-800 shadow-sm">
        
        {/* Left: Search & Pod Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search 32 specialists by name, role, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-72"
            />
          </div>

          {/* Pod Pill Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-xs font-semibold">
            <button
              onClick={() => setSelectedPod('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPod === 'ALL' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Pods ({employees.length})
            </button>
            {pods.map(pod => (
              <button
                key={pod.id}
                onClick={() => setSelectedPod(pod.id)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedPod === pod.id ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {pod.name.split(' - ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Group By Toggle & Legend */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGroupByPod(!groupByPod)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              groupByPod 
                ? 'bg-slate-800 text-white border-slate-600' 
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{groupByPod ? 'Grouped by Pod' : 'Flat List'}</span>
          </button>

          <div className="hidden xl:flex items-center gap-3 text-[11px] text-slate-400 pl-2 border-l border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-emerald-500"></span> Primary Shift
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-cyan-400"></span> Pod Backup
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-slate-600"></span> Scheduled Off
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-rose-500"></span> Leave / Sick
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-indigo-500"></span> Public Holiday
            </span>
          </div>
        </div>

      </div>

      {/* Main Roster Matrix Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#090e1a] shadow-2xl max-h-[660px]">
        <table className="w-full text-left border-collapse min-w-[1550px]">
          
          {/* Calendar Header */}
          <thead className="sticky top-0 z-30 bg-[#0c1222] border-b border-slate-800 shadow-md">
            <tr>
              <th className="sticky left-0 z-40 bg-[#0c1222] px-4 py-3 text-xs font-bold text-slate-200 uppercase tracking-wider w-64 border-r border-slate-800">
                Specialist & Pod Lead
              </th>
              {days.map(d => {
                const { dayName, dayNumber, isSunday, isSaturday, isHoliday, holidayName } = getDayDetails(d);
                return (
                  <th 
                    key={d} 
                    className={`px-1.5 py-2 text-center text-xs font-bold border-r border-slate-800/80 min-w-[70px] ${
                      isHoliday
                        ? 'bg-indigo-950/50 text-indigo-300'
                        : isSunday 
                          ? 'bg-slate-950/80 text-amber-400' 
                          : isSaturday
                            ? 'bg-slate-950/40 text-slate-300'
                            : 'text-slate-300'
                    }`}
                    title={isHoliday ? `Public Holiday: ${holidayName}` : undefined}
                  >
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{dayName}</div>
                    <div className="text-xs font-black tabular-nums">{dayNumber}</div>
                    {isHoliday && <div className="text-[8px] text-indigo-400 font-extrabold uppercase">Fest</div>}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {groupByPod ? (
              // Grouped by Pod Section View
              Object.entries(podGroups).map(([podId, { pod, employees: podEmps }]) => {
                if (podEmps.length === 0) return null;

                return (
                  <React.Fragment key={podId}>
                    {/* Pod Category Header Banner */}
                    <tr className="bg-slate-900/90 border-y border-slate-700/80">
                      <td colSpan={days.length + 1} className="px-4 py-2 font-black text-xs text-cyan-300 tracking-wide uppercase">
                        <div className="sticky left-4 inline-flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{pod.name}</span>
                          <span className="text-slate-400 font-semibold text-[10px] lowercase">
                            • lead: <strong className="text-slate-200 capitalize">{pod.lead_name}</strong>
                          </span>
                          <span className="text-slate-500 font-normal text-[10px] ml-4">
                            ({podEmps.length} Associates)
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Pod Employees Rows */}
                    {podEmps.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors group">
                        {/* Employee Identity Sticky Left Column */}
                        <td className="sticky left-0 z-20 bg-[#090e1a] group-hover:bg-[#0f172a] px-4 py-2 border-r border-slate-800 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                                {emp.name}
                                {emp.is_pod_lead && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-700/60 text-[9px] font-black uppercase flex items-center gap-1">
                                    <Crown className="w-2.5 h-2.5 text-amber-400" /> LEAD
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium truncate max-w-[190px]">
                                {emp.skills.join(' • ')}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 30-Day Matrix Cells */}
                        {days.map(d => {
                          const cell = cellMap.get(`${emp.id}_${d}`);
                          const { isSunday, isHoliday } = getDayDetails(d);
                          return (
                            <td 
                              key={d} 
                              onClick={() => onCellClick && onCellClick(cell, emp)}
                              className={`px-1 py-1.5 text-center border-r border-slate-800/50 cursor-pointer hover:bg-slate-800/60 transition-colors ${
                                isHoliday ? 'bg-indigo-950/15' : isSunday ? 'bg-slate-950/30' : ''
                              }`}
                            >
                              {renderBadge(cell)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            ) : (
              // Flat View
              filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="sticky left-0 z-20 bg-[#090e1a] group-hover:bg-[#0f172a] px-4 py-2 border-r border-slate-800 transition-colors">
                    <div className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                      {emp.name}
                      {emp.is_pod_lead && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-700/60 text-[9px] font-black uppercase">
                          LEAD
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {emp.pod_id} • {emp.skills.join('/')}
                    </div>
                  </td>

                  {days.map(d => {
                    const cell = cellMap.get(`${emp.id}_${d}`);
                    const { isSunday, isHoliday } = getDayDetails(d);
                    return (
                      <td 
                        key={d} 
                        onClick={() => onCellClick && onCellClick(cell, emp)}
                        className={`px-1 py-1.5 text-center border-r border-slate-800/50 cursor-pointer hover:bg-slate-800/60 transition-colors ${
                          isHoliday ? 'bg-indigo-950/15' : isSunday ? 'bg-slate-950/30' : ''
                        }`}
                      >
                        {renderBadge(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>

          {/* Bottom Aggregate: Daily Staffing Footprint */}
          <tfoot className="sticky bottom-0 z-20 bg-[#0c1222] border-t-2 border-slate-700/80 font-bold text-xs shadow-lg">
            <tr>
              <td className="sticky left-0 z-30 bg-[#0c1222] px-4 py-2.5 text-slate-300 uppercase tracking-wider text-[11px] border-r border-slate-800">
                Daily Active Headcount
              </td>
              {dailyActiveCount.map(d => (
                <td key={d.date} className="px-1 py-2 text-center border-r border-slate-800/80 text-[11px] tabular-nums font-black text-emerald-400">
                  {d.count}
                </td>
              ))}
            </tr>
          </tfoot>

        </table>
      </div>
    </div>
  );
}
