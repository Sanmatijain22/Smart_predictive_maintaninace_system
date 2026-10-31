import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  BrainCircuit, 
  Bell, 
  Wrench, 
  FileText,
  Building2
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onSelectTab,
  activeAlertCount = 0
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'machines',
      label: 'Live Machine Monitoring',
      icon: Activity,
      badge: '8 Active'
    },
    {
      id: 'predictions',
      label: 'AI Failure Intelligence',
      icon: BrainCircuit,
      badge: 'RF+IF'
    },
    {
      id: 'alerts',
      label: 'Predictive Alerts',
      icon: Bell,
      badge: activeAlertCount > 0 ? `${activeAlertCount} Open` : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'maintenance',
      label: 'Maintenance Management',
      icon: Wrench,
      badge: null
    },
    {
      id: 'reports',
      label: 'Audit & PDF Reports',
      icon: FileText,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-60px)]">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          OPERATIONAL SUITE
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Industrial Plant Info Box */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-2.5 mb-2">
          <Building2 className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-200">Escorts Kubota Limited</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          Tractor & Automotive Machinery Reliability Division.
        </p>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Sensors Monitored:</span>
            <span className="font-mono text-emerald-400 font-bold">48 Channels</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Model Engine:</span>
            <span className="font-mono text-blue-400 font-bold">Random Forest + IF</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
