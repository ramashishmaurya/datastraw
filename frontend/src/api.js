// API helper for DataStraw Smart Roster Engine
const API_BASE = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api` 
  : '/api';

export async function fetchMasterData() {
  const [podsRes, empsRes, brandsRes, allocsRes, holRes, leavesRes] = await Promise.all([
    fetch(`${API_BASE}/master-data/pods`),
    fetch(`${API_BASE}/master-data/employees`),
    fetch(`${API_BASE}/master-data/brands`),
    fetch(`${API_BASE}/master-data/allocations`),
    fetch(`${API_BASE}/master-data/holidays`),
    fetch(`${API_BASE}/master-data/leaves`),
  ]);

  return {
    pods: await podsRes.json(),
    employees: await empsRes.json(),
    brands: await brandsRes.json(),
    allocations: await allocsRes.json(),
    holidays: await holRes.json(),
    leaves: await leavesRes.json(),
  };
}

export async function fetchRoster(year = 2026, month = 11) {
  const res = await fetch(`${API_BASE}/roster?year=${year}&month=${month}`);
  if (!res.ok) throw new Error('Failed to fetch roster');
  return res.json();
}

export async function generateRoster(year = 2026, month = 11) {
  const res = await fetch(`${API_BASE}/roster/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year, month }),
  });
  if (!res.ok) throw new Error('Failed to generate roster');
  return res.json();
}

export async function updateRosterCell(payload) {
  const res = await fetch(`${API_BASE}/roster/cell`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update shift cell');
  return res.json();
}

export async function applyRecommendedFix(payload) {
  const res = await fetch(`${API_BASE}/roster/apply-fix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to apply recommended fix');
  return res.json();
}

export async function simulateChange(payload) {
  const res = await fetch(`${API_BASE}/simulation/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to evaluate simulation');
  return res.json();
}
