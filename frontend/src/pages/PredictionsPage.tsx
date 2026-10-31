import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Sliders, 
  Activity, 
  Thermometer, 
  Gauge, 
  Zap, 
  RotateCw, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Info,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { PredictionResult, Machine } from '../types';
import { fetchPredictions, analyzeTelemetry } from '../services/api';

interface PredictionsPageProps {
  machines: Machine[];
  onSelectMachine: (id: string) => void;
}

export const PredictionsPage: React.FC<PredictionsPageProps> = ({ 
  machines,
  onSelectMachine
}) => {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive "What-If" AI Sandbox state
  const [simTemp, setSimTemp] = useState<number>(65.0);
  const [simVib, setSimVib] = useState<number>(2.2);
  const [simRpm, setSimRpm] = useState<number>(2400);
  const [simPress, setSimPress] = useState<number>(120);
  const [simPower, setSimPower] = useState<number>(28);
  const [simHours, setSimHours] = useState<number>(3500);

  const [simResult, setSimResult] = useState<PredictionResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const loadPredictions = async () => {
    try {
      const data = await fetchPredictions();
      setPredictions(data.predictions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
    const interval = setInterval(loadPredictions, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRunInference = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeTelemetry({
        temperature: simTemp,
        vibration: simVib,
        rpm: simRpm,
        pressure: simPress,
        power: simPower,
        operating_hours: simHours
      });
      setSimResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  // Run initial what-if inference once
  useEffect(() => {
    handleRunInference();
  }, []);

  const featureImportances = [
    { name: 'Vibration (mm/s)', weight: 35.9, color: '#10B981' },
    { name: 'Temperature (°C)', weight: 24.8, color: '#EF4444' },
    { name: 'Power Consumption (kW)', weight: 23.5, color: '#F59E0B' },
    { name: 'Operating Hours (hrs)', weight: 9.2, color: '#8B5CF6' },
    { name: 'Hydraulic Pressure (bar)', weight: 6.3, color: '#0EA5E9' },
    { name: 'Rotational Speed (RPM)', weight: 0.3, color: '#64748B' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-blue-400" />
            <span>AI Failure Prediction & Anomaly Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400">
            Dual ML Architecture: Isolation Forest (unsupervised anomaly scoring) + Random Forest Classifier (failure risk classification).
          </p>
        </div>

        {/* Disclaimer Callout Pill */}
        <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-amber-400" />
          <span>Synthetic Training Model Outputs • Demonstration Pipeline</span>
        </div>
      </div>

      {/* Row 1: Model Architecture & Feature Importance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Model Architecture Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Ensemble Model Architecture
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
              v1.4 Scikit-Learn
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-bold text-blue-400 flex items-center justify-between">
                <span>1. Isolation Forest</span>
                <span className="text-[10px] font-mono text-slate-400">Unsupervised</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Detects multi-variate outliers and boundary violations in 6D sensor space without requiring fault labels.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-bold text-emerald-400 flex items-center justify-between">
                <span>2. Random Forest Classifier</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">99.8% Acc</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                120 decision trees trained on synthetic physical equipment degradation modes (bearing wear, cavitation, thermal runaway).
              </p>
            </div>
          </div>
        </div>

        {/* Feature Importance Card (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Random Forest Feature Importance Weights (Gini Impurity)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Normalized %</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {featureImportances.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.name}</span>
                  <span className="font-mono font-bold text-white">{item.weight}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.weight * 2.5}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Interactive "What-If" AI Sandbox Simulator */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-400" />
              <span>Interactive "What-If" AI Diagnostic Simulator</span>
            </h2>
            <p className="text-xs text-slate-400">
              Adjust telemetry values below and evaluate instant real-time predictions through the live trained Scikit-learn backend.
            </p>
          </div>
          <button
            onClick={handleRunInference}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
          >
            <Sparkles className="h-4 w-4" />
            <span>{analyzing ? 'Evaluating...' : 'Run AI Inference'}</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Temperature Slider */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5 text-rose-400" /> Temperature (°C)
              </span>
              <span className="font-mono font-bold text-white text-sm">{simTemp}°C</span>
            </div>
            <input 
              type="range" min="40" max="115" step="0.5" 
              value={simTemp} onChange={(e) => setSimTemp(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Nominal (60°C)</span>
              <span>Critical (&gt;90°C)</span>
            </div>
          </div>

          {/* Vibration Slider */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-emerald-400" /> Vibration (mm/s)
              </span>
              <span className="font-mono font-bold text-white text-sm">{simVib} mm/s</span>
            </div>
            <input 
              type="range" min="0.5" max="15.0" step="0.1" 
              value={simVib} onChange={(e) => setSimVib(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Nominal (&lt;2.5)</span>
              <span>Severe (&gt;7.0)</span>
            </div>
          </div>

          {/* Rotational Speed */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <RotateCw className="h-3.5 w-3.5 text-purple-400" /> Speed (RPM)
              </span>
              <span className="font-mono font-bold text-white text-sm">{simRpm} RPM</span>
            </div>
            <input 
              type="range" min="500" max="3500" step="50" 
              value={simRpm} onChange={(e) => setSimRpm(parseInt(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>500 RPM</span>
              <span>3500 RPM</span>
            </div>
          </div>

          {/* Hydraulic Pressure */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-sky-400" /> Hydraulic Press. (bar)
              </span>
              <span className="font-mono font-bold text-white text-sm">{simPress} bar</span>
            </div>
            <input 
              type="range" min="30" max="250" step="5" 
              value={simPress} onChange={(e) => setSimPress(parseInt(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Leak (&lt;60)</span>
              <span>Surge (&gt;200)</span>
            </div>
          </div>

          {/* Power Consumption */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-yellow-400" /> Power (kW)
              </span>
              <span className="font-mono font-bold text-white text-sm">{simPower} kW</span>
            </div>
            <input 
              type="range" min="5" max="90" step="1" 
              value={simPower} onChange={(e) => setSimPower(parseInt(e.target.value))}
              className="w-full accent-yellow-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Nominal (&lt;35)</span>
              <span>Overload (&gt;55)</span>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Operating Hours
              </span>
              <span className="font-mono font-bold text-white text-sm">{simHours} hrs</span>
            </div>
            <input 
              type="range" min="100" max="9500" step="100" 
              value={simHours} onChange={(e) => setSimHours(parseInt(e.target.value))}
              className="w-full accent-slate-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>New (&lt;2000)</span>
              <span>Fatigued (&gt;7500)</span>
            </div>
          </div>
        </div>

        {/* Live Inference Output Display */}
        {simResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-blue-900/40 shadow-inner space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Model Diagnostic Output:
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase font-mono ${
                  simResult.failure_risk === 'High Risk' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  simResult.failure_risk === 'Medium Risk' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {simResult.failure_risk}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span>Risk Probability: <strong className="font-mono text-white">{simResult.risk_score}%</strong></span>
                <span>•</span>
                <span>Anomaly Intensity: <strong className="font-mono text-amber-400">{simResult.anomaly_score}%</strong></span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              <strong>Assessment:</strong> {simResult.explanation}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="font-semibold text-blue-400">Contributing Sensor Signatures:</span>
                <ul className="mt-1 space-y-1 text-slate-300 text-[11px]">
                  {simResult.contributing_factors.map((cf, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                      <span>{cf}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="font-semibold text-emerald-400">Recommended Maintenance Action:</span>
                <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                  {simResult.recommended_action || 'Continue standard periodic inspections.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Live Predictions Across Monitored Machines */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Current Predictions Across All 8 Monitored Equipment
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Live Telemetry Synchronized</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {predictions.map((p) => {
            const isHigh = p.failure_risk === 'High Risk';
            const isMed = p.failure_risk === 'Medium Risk';

            return (
              <div
                key={p.machine_id}
                onClick={() => p.machine_id && onSelectMachine(p.machine_id)}
                className={`p-3.5 rounded-xl bg-slate-950/80 border transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                  isHigh ? 'border-rose-600/60 shadow-lg shadow-rose-950/20' :
                  isMed ? 'border-amber-600/60 shadow-lg shadow-amber-950/20' :
                  'border-slate-800 hover:border-blue-500/60'
                }`}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="font-mono font-bold text-xs text-blue-400">{p.machine_id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isHigh ? 'bg-rose-500/20 text-rose-300' :
                    isMed ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {p.failure_risk}
                  </span>
                </div>

                <div className="mt-2 text-xs font-bold text-white truncate">
                  {p.machine_name}
                </div>

                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Failure Probability:</span>
                    <span className="font-mono font-bold text-white">{(p.failure_probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Anomaly Score:</span>
                    <span className="font-mono font-bold text-amber-400">{p.anomaly_score}%</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-900 text-[11px] text-slate-300 line-clamp-2">
                  {p.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
