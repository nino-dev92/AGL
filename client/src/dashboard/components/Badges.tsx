type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';
type MatchStatus = 'scheduled' | 'ongoing' | 'completed';
type PlayerStatus = 'online' | 'offline' | 'away';
type Priority = 'info' | 'warning' | 'critical';

export function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
  const map: Record<TournamentStatus, { label: string; cls: string; dot: string }> = {
    upcoming: { label: 'Upcoming', cls: 'bg-dash-gold-500/15 text-dash-gold-400 border border-dash-gold-500/30', dot: 'bg-dash-gold-400' },
    ongoing: { label: 'Live', cls: 'bg-dash-red-600/15 text-dash-red-400 border border-dash-red-600/30', dot: 'bg-dash-red-500 animate-dash-pulse-dot' },
    completed: { label: 'Completed', cls: 'bg-dash-ink-700/40 text-dash-ink-300 border border-dash-ink-600/40', dot: 'bg-dash-ink-400' },
  };
  const s = map[status];
  return (
    <span className={`badge ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const map: Record<MatchStatus, { label: string; cls: string }> = {
    scheduled: { label: 'Scheduled', cls: 'bg-dash-ink-700/40 text-dash-ink-300 border border-dash-ink-600/40' },
    ongoing: { label: 'Live Now', cls: 'bg-dash-red-600/15 text-dash-red-400 border border-dash-red-600/30' },
    completed: { label: 'Final', cls: 'bg-green-600/15 text-green-400 border border-green-600/30' },
  };
  const s = map[status];
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export function PlayerStatusBadge({ status }: { status: PlayerStatus }) {
  const map: Record<PlayerStatus, { label: string; cls: string; dot: string }> = {
    online: { label: 'Online', cls: 'text-green-400', dot: 'bg-green-500 animate-dash-pulse-dot' },
    away: { label: 'Away', cls: 'text-dash-gold-400', dot: 'bg-dash-gold-400' },
    offline: { label: 'Offline', cls: 'text-dash-ink-400', dot: 'bg-dash-ink-500' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${s.cls}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, { label: string; cls: string }> = {
    info: { label: 'Info', cls: 'bg-blue-600/15 text-blue-400 border border-blue-600/30' },
    warning: { label: 'Warning', cls: 'bg-dash-gold-500/15 text-dash-gold-400 border border-dash-gold-500/30' },
    critical: { label: 'Critical', cls: 'bg-dash-red-600/15 text-dash-red-400 border border-dash-red-600/30' },
  };
  const s = map[priority];
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export function RankBadge({ rank }: { rank: string }) {
  const map: Record<string, string> = {
    Diamond: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10',
    Platinum: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
    Gold: 'text-dash-gold-400 border-dash-gold-500/40 bg-dash-gold-500/10',
    Silver: 'text-dash-ink-200 border-dash-ink-500/40 bg-dash-ink-700/30',
    Unranked: 'text-dash-ink-400 border-dash-ink-600/40 bg-dash-ink-800/30',
  };
  const cls = map[rank] ?? map.Unranked;
  return <span className={`badge ${cls}`}>{rank}</span>;
}
