import { useState } from 'react';
import './dashboard.css';
import { LuGamepad2 as Gamepad2, LuLayoutDashboard as LayoutDashboard, LuUsers as Users, LuShieldCheck as ShieldCheck, LuChevronRight as ChevronRight, LuActivity as Activity } from 'react-icons/lu';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';

type View = 'organizer' | 'manager' | 'admin';

export default function DashboardApp() {
  const [view, setView] = useState<View>('organizer');

  const viewLabel = view === 'organizer' ? 'Organizer' : view === 'manager' ? 'Manager' : 'Admin';

  return (
    <div className="dash-root min-h-screen bg-dash-ink-950">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-linear-to-r/srgb from-transparent via-dash-red-600/60 to-transparent" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-linear-to-b/srgb from-dash-red-950/20 to-transparent" />

      <header className="sticky top-0 z-40 border-b border-dash-ink-800/60 bg-dash-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br/srgb from-dash-red-600 to-dash-red-800 shadow-dash-glow">
                <Gamepad2 size={22} className="text-white" />
              </div>
              <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-dash-ink-950 bg-dash-gold-500" />
            </div>
            <div>
              <h1 className="font-dash-display text-2xl tracking-widest text-white">AGL</h1>
              <p className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-dash-gold-400">Gaming Dashboard</p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-1 rounded-xl border border-dash-ink-800/60 bg-dash-ink-900/60 p-1">
            <NavButton active={view === 'organizer'} onClick={() => setView('organizer')} icon={LayoutDashboard} label="Organizer" />
            <NavButton active={view === 'manager'} onClick={() => setView('manager')} icon={Users} label="Manager" />
            <NavButton active={view === 'admin'} onClick={() => setView('admin')} icon={ShieldCheck} label="Admin" />
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex items-center gap-2 text-xs text-dash-ink-400">
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="font-semibold text-dash-ink-200">{viewLabel}</span>
        </div>

        <div className="animate-dash-fade-in" key={view}>
          {view === 'organizer' ? <OrganizerDashboard /> : view === 'manager' ? <ManagerDashboard /> : <AdminDashboard />}
        </div>
      </main>

      <footer className="border-t border-dash-ink-800/60 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-xs text-dash-ink-500">Agl Gaming Platform — Control Center</p>
          <div className="flex items-center gap-1.5 text-xs text-dash-ink-500">
            <Activity size={12} className="text-green-500" />
            <span>Systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutDashboard;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all sm:px-4 ${
        active
          ? 'bg-dash-red-600 text-white shadow-dash-glow'
          : 'text-dash-ink-300 hover:bg-dash-ink-800 hover:text-white'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

