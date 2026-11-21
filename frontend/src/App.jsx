import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CompanyView from './components/views/CompanyView';
import PodView from './components/views/PodView';
import BrandView from './components/views/BrandView';
import ProcessView from './components/views/ProcessView';
import EmployeeView from './components/views/EmployeeView';
import ConflictDrawer from './components/ConflictDrawer';
import SimulationModal from './components/SimulationModal';
import CellEditModal from './components/CellEditModal';

import { 
  fetchMasterData, fetchRoster, generateRoster, 
  updateRosterCell, applyRecommendedFix 
} from './api';

import { 
  Grid, Users, Briefcase, Layers, User, 
  AlertTriangle, CheckCircle2, ShieldCheck, Loader2 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('COMPANY');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // Data states
  const [masterData, setMasterData] = useState({
    pods: [],
    employees: [],
    brands: [],
    allocations: [],
    holidays: [],
    leaves: [],
  });

  const [rosterData, setRosterData] = useState({
    year: 2026,
    month: 11,
    cells: [],
    conflicts: [],
    metrics: {},
  });

  // Modal / Drawer states
  const [isConflictDrawerOpen, setIsConflictDrawerOpen] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [cellToEdit, setCellToEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Data Load
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [master, roster] = await Promise.all([
          fetchMasterData(),
          fetchRoster(2026, 11),
        ]);
        setMasterData(master);
        setRosterData(roster);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Regenerate Roster
  const handleRegenerate = async () => {
    try {
      setIsGenerating(true);
      const updated = await generateRoster(2026, 11);
      setRosterData(updated);
      showToast("✓ Monthly roster regenerated with deterministic constraint solver!");
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 1-Click Fix Handler
  const handleApplyFix = async (conf) => {
    if (!conf.suggested_employee_id || !conf.brand_id || !conf.process_type) {
      alert("Missing details to auto-deploy backup.");
      return;
    }

    try {
      setIsResolving(true);
      const updated = await applyRecommendedFix({
        date: conf.date,
        brand_id: conf.brand_id,
        process_type: conf.process_type,
        backup_employee_id: conf.suggested_employee_id,
      });
      setRosterData(updated);
      showToast(`✓ Deployed ${conf.suggested_employee_name} as Pod Backup for ${conf.brand_name}!`);
    } catch (err) {
      alert(`Failed to apply fix: ${err.message}`);
    } finally {
      setIsResolving(false);
    }
  };

  // Manual Cell Edit Handler
  const handleSaveCellEdit = async (payload) => {
    try {
      const updated = await updateRosterCell(payload);
      setRosterData(updated);
      showToast("✓ Shift updated and operational constraints recalculated!");
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // Apply Simulation to Live Roster
  const handleApplySimulation = async (simPayload) => {
    try {
      const updated = await updateRosterCell(simPayload);
      setRosterData(updated);
      setIsConflictDrawerOpen(true); // Open conflicts drawer to show new gap
      showToast(`✓ Applied ${simPayload.status} to live roster! Gaps highlighted in red.`);
    } catch (err) {
      alert(`Failed to apply simulation: ${err.message}`);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Employee ID', 'Employee Name', 'Pod', 'Status', 'Brand', 'Process', 'Is Backup', 'Notes'];
    const empMap = new Map(masterData.employees.map(e => [e.id, e]));

    const rows = rosterData.cells.map(c => {
      const emp = empMap.get(c.employee_id);
      return [
        c.date,
        c.employee_id,
        `"${c.employee_name || emp?.name || ''}"`,
        `"${emp?.pod_id || ''}"`,
        c.status,
        `"${c.brand_name || ''}"`,
        c.process_type || '',
        c.is_backup ? 'YES' : 'NO',
        `"${c.notes || ''}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DataStraw_Roster_Nov_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("✓ Exported DataStraw_Roster_Nov_2026.csv");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-lg font-bold">Initializing DataStraw Roster Engine...</h2>
        <p className="text-xs text-slate-400 mt-1">Loading 32 Employees, 16 Brands, 4 Pods & Constraints</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        metrics={rosterData.metrics}
        onRegenerate={handleRegenerate}
        onOpenConflicts={() => setIsConflictDrawerOpen(true)}
        onOpenSimulation={() => setIsSimulationModalOpen(true)}
        onExportCSV={handleExportCSV}
        isGenerating={isGenerating}
        totalConflicts={rosterData.conflicts.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-6 py-5 space-y-5">
        
        {/* Navigation Tabs (5 Core Views from Section 3E) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('COMPANY')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'COMPANY' 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Company Master Roster (32)</span>
            </button>

            <button
              onClick={() => setActiveTab('POD')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'POD' 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Pod Teams (4)</span>
            </button>

            <button
              onClick={() => setActiveTab('BRAND')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'BRAND' 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Brand SLA Coverage (16)</span>
            </button>

            <button
              onClick={() => setActiveTab('PROCESS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'PROCESS' 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Process Staffing (CS/ACC/NDR)</span>
            </button>

            <button
              onClick={() => setActiveTab('EMPLOYEE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'EMPLOYEE' 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Employee Schedule</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Constraint Engine Active • {rosterData.cells.length} Shifts Monitored</span>
          </div>
        </div>

        {/* View Component Switcher */}
        {activeTab === 'COMPANY' && (
          <CompanyView
            cells={rosterData.cells}
            employees={masterData.employees}
            pods={masterData.pods}
            brands={masterData.brands}
            onCellClick={(cell, emp) => setCellToEdit({ cell, employee: emp })}
          />
        )}

        {activeTab === 'POD' && (
          <PodView
            pods={masterData.pods}
            employees={masterData.employees}
            brands={masterData.brands}
            cells={rosterData.cells}
            onCellClick={(cell, emp) => setCellToEdit({ cell, employee: emp })}
          />
        )}

        {activeTab === 'BRAND' && (
          <BrandView
            brands={masterData.brands}
            allocations={masterData.allocations}
            employees={masterData.employees}
            cells={rosterData.cells}
            conflicts={rosterData.conflicts}
            onResolveConflict={handleApplyFix}
          />
        )}

        {activeTab === 'PROCESS' && (
          <ProcessView
            cells={rosterData.cells}
            employees={masterData.employees}
            brands={masterData.brands}
          />
        )}

        {activeTab === 'EMPLOYEE' && (
          <EmployeeView
            employees={masterData.employees}
            pods={masterData.pods}
            brands={masterData.brands}
            cells={rosterData.cells}
            onCellClick={(cell, emp) => setCellToEdit({ cell, employee: emp })}
          />
        )}

      </main>

      {/* Slide-over Conflict Drawer */}
      <ConflictDrawer
        isOpen={isConflictDrawerOpen}
        onClose={() => setIsConflictDrawerOpen(false)}
        conflicts={rosterData.conflicts}
        onApplyFix={handleApplyFix}
        isResolving={isResolving}
      />

      {/* Section 3F Simulation Modal */}
      <SimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        employees={masterData.employees}
        onApplySimulationToLive={handleApplySimulation}
      />

      {/* Manual Shift Cell Edit Modal */}
      {cellToEdit && (
        <CellEditModal
          cell={cellToEdit.cell}
          employee={cellToEdit.employee}
          brands={masterData.brands}
          isOpen={Boolean(cellToEdit)}
          onClose={() => setCellToEdit(null)}
          onSave={handleSaveCellEdit}
        />
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
