import React, { useState } from 'react';
import { Users, Crown, Shield, Briefcase, ChevronRight, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function PodView({ pods, employees, brands, cells, onCellClick }) {
  const [activePodId, setActivePodId] = useState(pods[0]?.id || 'pod-1');

  const selectedPod = pods.find(p => p.id === activePodId) || pods[0];
  const podEmployees = employees.filter(e => e.pod_id === selectedPod?.id);
  const podBrands = brands.filter(b => b.pod_id === selectedPod?.id);

  // Calculate pod capacity and working stats
  const podStats = podEmployees.map(emp => {
    const empCells = cells.filter(c => c.employee_id === emp.id);
    const workingDays = empCells.filter(c => c.status === 'WORKING').length;
    const offs = empCells.filter(c => c.status === 'WEEKLY_OFF').length;
    const leaves = empCells.filter(c => ['PLANNED_LEAVE', 'SICK_LEAVE', 'COMP_OFF'].includes(c.status)).length;
    return { emp, workingDays, offs, leaves };
  });

  return (
    <div className="space-y-6">
      {/* Pod Selection Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {pods.map(pod => {
          const isSelected = pod.id === activePodId;
          const memberCount = employees.filter(e => e.pod_id === pod.id).length;
          const brandCount = brands.filter(b => b.pod_id === pod.id).length;

          return (
            <div
              key={pod.id}
              onClick={() => setActivePodId(pod.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {pod.name.split(' - ')[0]}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {brandCount} Brands
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate mb-1">
                {pod.name.split(' - ')[1] || pod.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-purple-300 font-medium mt-3">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Lead: {pod.lead_name}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {memberCount} Dedicated Associates
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Pod Deep-Dive */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white">{selectedPod.name}</h2>
              <span className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-800/60 text-purple-300 text-xs font-bold flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> Pod Lead: {selectedPod.lead_name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{selectedPod.description}</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Pod Health:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Readiness Buffer
            </span>
          </div>
        </div>

        {/* Brands Managed in this Pod */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            Brands Assigned to this Pod ({podBrands.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {podBrands.map(b => (
              <div key={b.id} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white truncate max-w-[140px]">{b.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    b.is_single_resource 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {b.is_single_resource ? 'Single-Resource (80%)' : 'Multi-Staff'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Model: <span className="text-slate-200">{b.operating_model}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pod Team Roster Table */}
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          Pod Associates & Monthly Allocations
        </h4>
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Associate Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Certified Skills</th>
                <th className="px-4 py-3 text-center">Working Shifts</th>
                <th className="px-4 py-3 text-center">Weekly Offs</th>
                <th className="px-4 py-3 text-center">Leaves</th>
                <th className="px-4 py-3">Backup Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {podStats.map(({ emp, workingDays, offs, leaves }) => (
                <tr key={emp.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                    {emp.name}
                    {emp.is_pod_lead && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-900 text-purple-300 text-[9px] font-black">
                        LEAD
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {emp.is_pod_lead ? 'Pod Lead / Escalations' : 'Operations Specialist'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {emp.skills.map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-400">{workingDays} Days</td>
                  <td className="px-4 py-3 text-center text-slate-400">{offs} Days</td>
                  <td className="px-4 py-3 text-center font-semibold text-rose-400">{leaves} Days</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Ready for Pod Backup
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
