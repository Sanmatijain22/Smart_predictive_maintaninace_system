import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Radio, 
  AlertTriangle, 
  Cpu, 
  Flame, 
  Droplets, 
  Zap,
  Info
} from 'lucide-react';
import { startSimulation, pauseSimulation, triggerSimulationScenario, resetSimulation } from '../services/api';

interface NavbarProps {
  simulationRunning: boolean;
  onRefresh: () => void;
  activeScenario?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  simulationRunning, 
  onRefresh,
  activeScenario = 'NORMAL'
}) => {
  const [loading, setLoading] = useState(false);
  const [scenarioMenuOpen, setScenarioMenuOpen] = useState(false);

  const handleToggleSimulation = async () => {
    setLoading(true);
    try {
      if (simulationRunning) {
        await pauseSimulation();
      } else {
        await startSimulation();
      }
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerScenario = async (scenario: string, machineId: string, faultType: string) => {
    setLoading(true);
    setScenarioMenuOpen(false);
    try {
      await triggerSimulationScenario(scenario, machineId, faultType);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetSimulation();
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 px-4 lg:px-6 py-2.5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Location Info */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wide text-base text-white">SMARTMFG AI</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50 font-mono font-medium">
                v1.4 PROD
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="font-semibold text-slate-300">PLANT:</span> ESCORTS-KUBOTA-HQ
              <span className="text-slate-600">•</span>
              <span>DEPT: Manufacturing Operations</span>
            </div>
          </div>
        </div>

        {/* Center: Prominent Simulated Data Warning */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase animate-pulse">
            <Info className="h-3.5 w-3.5" />
            <span>DEMO / SIMULATED DATA — INDUSTRIAL PILOT</span>
          </div>
        </div>

        {/* Right Controls: Simulation State & Scenarios */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Live Telemetry Ping indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-xs">
            <Radio className={`h-3 w-3 ${simulationRunning ? 'text-emerald-400 animate-ping' : 'text-slate-500'}`} />
            <span className={simulationRunning ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
              {simulationRunning ? 'TELEMETRY LIVE' : 'STREAM PAUSED'}
            </span>
          </div>

          {/* Start / Pause Button */}
          <button
            onClick={handleToggleSimulation}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              simulationRunning
                ? 'bg-amber-600/20 text-amber-300 border border-amber-600/50 hover:bg-amber-600/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
            }`}
          >
            {simulationRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause Sim</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Start Sim</span>
              </>
            )}
          </button>

          {/* Demonstration Scenarios Dropdown */}
          <div className="relative">
            <button
              onClick={() => setScenarioMenuOpen(!scenarioMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Demo Scenarios</span>
            </button>

            {scenarioMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 text-xs">
                <div className="px-2 py-1 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1.5 mb-1.5">
                  Select Demonstration Scenario
                </div>
                <button
                  onClick={() => handleTriggerScenario('NORMAL', 'CNC-001', 'normal')}
                  className="w-full text-left p-2 rounded hover:bg-slate-800 flex items-start gap-2.5 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 text-emerald-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Scenario 1: Nominal Baseline</div>
                    <div className="text-[11px] text-slate-400">All machines operating within green envelope</div>
                  </div>
                </button>
                <button
                  onClick={() => handleTriggerScenario('FAULT_INJECTION', 'CNC-001', 'bearing_and_thermal')}
                  className="w-full text-left p-2 rounded hover:bg-slate-800 flex items-start gap-2.5 transition-colors"
                >
                  <Flame className="h-4 w-4 text-rose-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-rose-300">Scenario 2: CNC Overheat & Bearing Wear</div>
                    <div className="text-[11px] text-slate-400">Ramps Temp &gt; 90°C & Vib &gt; 8 mm/s on CNC-001</div>
                  </div>
                </button>
                <button
                  onClick={() => handleTriggerScenario('FAULT_INJECTION', 'HYD-002', 'hydraulic_leak')}
                  className="w-full text-left p-2 rounded hover:bg-slate-800 flex items-start gap-2.5 transition-colors"
                >
                  <Droplets className="h-4 w-4 text-sky-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sky-300">Scenario 3: Hydraulic Press Leak</div>
                    <div className="text-[11px] text-slate-400">Severe pressure drop on HYD-002 to &lt; 60 bar</div>
                  </div>
                </button>
                <button
                  onClick={() => handleTriggerScenario('FAULT_INJECTION', 'CNV-007', 'electrical_overload')}
                  className="w-full text-left p-2 rounded hover:bg-slate-800 flex items-start gap-2.5 transition-colors"
                >
                  <Zap className="h-4 w-4 text-yellow-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-yellow-300">Scenario 4: Conveyor Motor Overcurrent</div>
                    <div className="text-[11px] text-slate-400">Motor drag & power surge on CNV-007</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Reset Baseline Button */}
          <button
            onClick={handleReset}
            disabled={loading}
            title="Reset all machines to baseline"
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
