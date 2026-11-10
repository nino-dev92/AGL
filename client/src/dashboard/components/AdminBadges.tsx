export function EscalationBadge({ level }: { level: 'none' | 'low' | 'medium' | 'high' }) {
  const map = {
    none: { label: 'None', cls: 'bg-dash-ink-700/40 text-dash-ink-300 border border-dash-ink-600/40' },
    low: { label: 'Low', cls: 'bg-blue-600/15 text-blue-400 border border-blue-600/30' },
    medium: { label: 'Medium', cls: 'bg-dash-gold-500/15 text-dash-gold-400 border border-dash-gold-500/30' },
    high: { label: 'High', cls: 'bg-dash-red-600/15 text-dash-red-400 border border-dash-red-600/30' },
  } as const;
  const s = map[level];
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export function DisputeStatusBadge({ status }: { status: 'open' | 'reviewing' | 'escalated' | 'closed' }) {
  const map = {
    open: { label: 'Open', cls: 'bg-dash-gold-500/15 text-dash-gold-400 border border-dash-gold-500/30', dot: 'bg-dash-gold-400' },
    reviewing: { label: 'Reviewing', cls: 'bg-blue-600/15 text-blue-400 border border-blue-600/30', dot: 'bg-blue-400' },
    escalated: { label: 'Escalated', cls: 'bg-dash-red-600/15 text-dash-red-400 border border-dash-red-600/30', dot: 'bg-dash-red-500 animate-dash-pulse-dot' },
    closed: { label: 'Closed', cls: 'bg-green-600/15 text-green-400 border border-green-600/30', dot: 'bg-green-500' },
  } as const;
  const s = map[status];
  return (
    <span className={`badge ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function PriorityPill({ priority }: { priority: 'low' | 'medium' | 'high' | 'critical' }) {
  const map = {
    low: 'text-blue-400 bg-blue-600/10',
    medium: 'text-dash-gold-400 bg-dash-gold-500/10',
    high: 'text-orange-400 bg-orange-600/10',
    critical: 'text-dash-red-400 bg-dash-red-600/10',
  } as const;
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold capitalize ${map[priority]}`}>{priority}</span>;
}

export function StakingStatusBadge({ status }: { status: 'eligible' | 'pending' | 'flagged' | 'escalated' }) {
  const map = {
    eligible: { label: 'Eligible', cls: 'bg-green-600/15 text-green-400 border border-green-600/30' },
    pending: { label: 'Pending', cls: 'bg-dash-gold-500/15 text-dash-gold-400 border border-dash-gold-500/30' },
    flagged: { label: 'Flagged', cls: 'bg-orange-600/15 text-orange-400 border border-orange-600/30' },
    escalated: { label: 'Escalated', cls: 'bg-dash-red-600/15 text-dash-red-400 border border-dash-red-600/30' },
  } as const;
  const s = map[status];
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export function TeamStatusBadge({ status }: { status: 'active' | 'suspended' | 'disbanded' }) {
  const map = {
    active: { label: 'Active', cls: 'bg-green-600/15 text-green-400 border border-green-600/30' },
    suspended: { label: 'Suspended', cls: 'bg-dash-red-600/15 text-dash-red-400 border border-dash-red-600/30' },
    disbanded: { label: 'Disbanded', cls: 'bg-dash-ink-700/40 text-dash-ink-400 border border-dash-ink-600/40' },
  } as const;
  const s = map[status];
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export function SuspendedTag() {
  return <span className="badge bg-dash-red-600/15 text-dash-red-400 border border-dash-red-600/30">Suspended</span>;
}
