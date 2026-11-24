import React, { useState, useMemo } from 'react';
import { Layers, Headphones, ShoppingCart, Truck, Repeat, Users, BarChart3 } from 'lucide-react';

const PROCESS_METADATA = {
  CS: { name: 'Customer Support', icon: Headphones, color: 'emerald', desc: 'Real-time chat, email, inbound queries' },
  ACC: { name: 'Abandoned Cart Conversions', icon: ShoppingCart, color: 'cyan', desc: 'Outbound sales calls, WhatsApp recovery' },
  NDR: { name: 'Non-Delivery Report Management', icon: Truck, color: 'amber', desc: 'Courier return prevention, address validation' },
  RETENTION: { name: 'Customer Retention & Loyalty', icon: Repeat, color: 'purple', desc: 'Re-engagement campaigns, loyalty perks' },
};

export default function ProcessView({ cells, employees, brands }) {
  const [selectedProcess, setSelectedProcess] = useState('CS');

  const meta = PROCESS_METADATA[selectedProcess] || PROCESS_METADATA.CS;
  const Icon = meta.icon;

  // Extract all days
  const days = useMemo(() => {
    const datesSet = new Set(cells.map(c => c.date));
    return Array.from(datesSet).sort();
  }, [cells]);

  // Calculate daily headcount working in this process
  const dailyHeadcount = useMemo(() => {
    return days.map(d => {
      // Find cells working on this date in this process
      const activeCells = cells.filter(
        c => c.date === d && c.status === 'WORKING' && c.process_type === selectedProcess
      );

      const dt = new Date(d);
      const dayNum = dt.getDate();
      const isSunday = dt.getDay() === 0;

      return {
        date: d,
        dayNum,
        isSunday,
        count: activeCells.length,
        employees: activeCells.map(c => c.employee_name || c.employee_id)
      };
    });
  }, [days, cells, selectedProcess]);

  const maxDailyCount = Math.max(...dailyHeadcount.map(d => d.count), 1);

  // Total certified employees for this process
  const certifiedEmployees = employees.filter(e => e.skills.includes(selectedProcess));

  return (
    <div className="space-y-6">
      {/* Process Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Object.entries(PROCESS_METADATA).map(([procKey, pMeta]) => {
          const isSelected = procKey === selectedProcess;
          const PIcon = pMeta.icon;
          const certCount = employees.filter(e => e.skills.includes(procKey)).length;

          return (
            <div
              key={procKey}
              onClick={() => setSelectedProcess(procKey)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/50' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                  <PIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {certCount} Certified
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{pMeta.name}</h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{pMeta.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Selected Process Analytics & Capacity Bar Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{meta.name} ({selectedProcess})</h2>
              <p className="text-xs text-slate-400 mt-0.5">{meta.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Total Skilled Pool</span>
              <span className="font-bold text-white text-sm">{certifiedEmployees.length} Associates</span>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-slate-400 block text-[10px]">Avg Daily Active</span>
              <span className="font-bold text-cyan-400 text-sm">
                {(dailyHeadcount.reduce((acc, d) => acc + d.count, 0) / (dailyHeadcount.length || 1)).toFixed(1)} / day
              </span>
            </div>
          </div>
        </div>

        {/* 30-Day Staffing Headcount Bar Chart */}
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          Daily Manpower Distribution Across November (Headcount)
        </h4>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-end gap-1.5 h-44 pt-6">
            {dailyHeadcount.map(d => {
              const heightPercent = Math.max((d.count / maxDailyCount) * 100, 8);
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-30 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap">
                    <span className="font-bold">{d.date}: {d.count} staff</span>
                    <span className="text-slate-400 text-[9px]">{d.isSunday ? 'Sunday' : 'Regular day'}</span>
                  </div>

                  <span className="text-[9px] font-bold text-slate-400 mb-1 opacity-80 group-hover:text-cyan-300">
                    {d.count}
                  </span>
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      d.isSunday 
                        ? 'bg-amber-500/70 group-hover:bg-amber-400' 
                        : 'bg-cyan-600/80 group-hover:bg-cyan-400'
                    }`}
                  />
                  <span className={`text-[9px] font-semibold mt-1.5 ${d.isSunday ? 'text-amber-400' : 'text-slate-500'}`}>
                    {d.dayNum}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800/60">
            <span>Nov 1 (Start of Month)</span>
            <span className="flex items-center gap-2 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-cyan-600"></span> Weekday Shift
              <span className="w-2.5 h-2.5 rounded bg-amber-500 ml-3"></span> Sunday Shift
            </span>
            <span>Nov 30 (End of Month)</span>
          </div>
        </div>

        {/* Cross-Trained Team Roster */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Cross-Trained Associates for {meta.name} ({certifiedEmployees.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {certifiedEmployees.map(emp => (
              <div key={emp.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{emp.name}</div>
                  <div className="text-[10px] text-slate-400">{emp.pod_id}</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Ready
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
