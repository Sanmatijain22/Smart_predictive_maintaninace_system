import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DemoScenarioGuide } from './components/DemoScenarioGuide';
import { DashboardPage } from './pages/DashboardPage';
import { MachinesPage } from './pages/MachinesPage';
import { MachineDetailPage } from './pages/MachineDetailPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { AlertsPage } from './pages/AlertsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ReportsPage } from './pages/ReportsPage';
import { Machine, DashboardStats } from './types';
import { fetchDashboardStats, fetchMachines } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Load stats and machines from REST API
  const refreshData = async () => {
    try {
      const [s, m] = await Promise.all([
        fetchDashboardStats(),
        fetchMachines('all')
      ]);
      setStats(s);
      setMachines(m);
      setSimulationRunning(s.simulation_running);
    } catch (e) {
      console.error('Error refreshing telemetry:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Polling fallback to keep stats & machines fresh
  useEffect(() => {
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket for real-time live telemetry
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // Handled by Vite proxy
    const wsUrl = `${protocol}//${host}/ws/sensors`;

    let socket: WebSocket;
    let reconnectTimeout: any;

    const connectWs = () => {
      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          setWsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'TELEMETRY_UPDATE' && Array.isArray(data.machines)) {
              // Update machines state with fresh live values
              setMachines((prev) =>
                prev.map((m) => {
                  const updated = data.machines.find((u: any) => u.id === m.id);
                  if (updated) {
                    return {
                      ...m,
                      current_temperature: updated.temperature,
                      current_vibration: updated.vibration,
                      current_rpm: updated.rpm,
                      current_pressure: updated.pressure,
                      current_power: updated.power,
                      operating_hours: updated.operating_hours,
                      health_score: updated.health_score,
                      anomaly_score: updated.anomaly_score,
                      failure_risk: updated.failure_risk,
                      failure_probability: updated.failure_probability,
                      status: updated.status,
                    };
                  }
                  return m;
                })
              );
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        socket.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch (err) {
        console.error('WebSocket connection error:', err);
      }
    };

    connectWs();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handleSelectMachine = (id: string) => {
    setSelectedMachineId(id);
    setCurrentTab('machine-detail');
  };

  const handleBackToMachines = () => {
    setSelectedMachineId(null);
    setCurrentTab('machines');
  };

  const handleNavigateTab = (tab: string) => {
    if (tab !== 'machine-detail') {
      setSelectedMachineId(null);
    }
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        simulationRunning={simulationRunning}
        onRefresh={refreshData}
        activeScenario={stats?.active_scenario || 'NORMAL'}
      />

      {/* Demo Scenario Walkthrough Bar */}
      <DemoScenarioGuide
        onSelectMachine={handleSelectMachine}
        onNavigateTab={handleNavigateTab}
        onRefresh={refreshData}
      />

      {/* Main Content with Industrial Navy Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleNavigateTab}
          activeAlertCount={stats?.active_alerts_count || 0}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              machines={machines}
              onSelectMachine={handleSelectMachine}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'machines' && (
            <MachinesPage
              machines={machines}
              onSelectMachine={handleSelectMachine}
              onRefresh={refreshData}
            />
          )}

          {currentTab === 'machine-detail' && selectedMachineId && (
            <MachineDetailPage
              machineId={selectedMachineId}
              onBack={handleBackToMachines}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {currentTab === 'predictions' && (
            <PredictionsPage
              machines={machines}
              onSelectMachine={handleSelectMachine}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsPage
              onSelectMachine={handleSelectMachine}
              onRefreshStats={refreshData}
            />
          )}

          {currentTab === 'maintenance' && (
            <MaintenancePage
              machines={machines}
              onSelectMachine={handleSelectMachine}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsPage
              machines={machines}
              onSelectMachine={handleSelectMachine}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
