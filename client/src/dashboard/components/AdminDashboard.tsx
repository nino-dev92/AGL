import { useEffect, useState, useCallback } from 'react';
import {
  supabase,
  type Player,
  type Tournament,
  type Match,
  type Team,
  type TeamMembershipWithPlayer,
  type Dispute,
  type AuditEntry,
  type Organizer,
} from '../lib/supabase';
import { logAudit } from '../lib/audit';
import { Modal } from './Modal';
import { EmptyState, Spinner } from './Feedback';
import { TournamentStatusBadge, MatchStatusBadge, RankBadge } from './Badges';
import {
  EscalationBadge,
  DisputeStatusBadge,
  PriorityPill,
  TeamStatusBadge,
  SuspendedTag,
} from './AdminBadges';
import { LuShieldCheck as ShieldCheck, LuUsers as Users, LuUsersRound as UsersRound, LuTrophy as Trophy, LuSwords as Swords, LuScale as Scale, LuScrollText as ScrollText, LuSearch as Search, LuChevronRight as ChevronRight, LuBan as Ban, LuCircleCheck as CheckCircle2, LuGavel as Gavel, LuFlag as Flag, LuSave as Save, LuPencil as Pencil, LuTriangleAlert as AlertTriangle, LuActivity as Activity, LuShieldAlert as ShieldAlert, LuCircleUser as CircleUser, LuEye as Eye, LuUserPlus as UserPlus, LuMail as Mail, LuLock as Lock, LuTrash2 as Trash2 } from 'react-icons/lu';

type AdminTab =
  | 'overview' | 'users' | 'teams' | 'tournaments' | 'results'
  | 'disputes' | 'organizers' | 'audit';

export function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [p, t, m, tm, d, al, org] = await Promise.all([
      supabase.from('players').select('*').order('created_at', { ascending: false }),
      supabase.from('tournaments').select('*').order('start_date', { ascending: true }),
      supabase.from('matches').select('*').order('scheduled_at', { ascending: false }),
      supabase.from('teams').select('*').order('name'),
      supabase.from('disputes').select('*').order('created_at', { ascending: false }),
      supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('organizers').select('*').order('created_at', { ascending: false }),
    ]);
    setPlayers((p.data as Player[] | null) ?? []);
    setTournaments((t.data as Tournament[] | null) ?? []);
    setMatches((m.data as Match[] | null) ?? []);
    setTeams((tm.data as Team[] | null) ?? []);
    setDisputes((d.data as Dispute[] | null) ?? []);
    setAuditLog((al.data as AuditEntry[] | null) ?? []);
    setOrganizers((org.data as Organizer[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadAll);
  }, [loadAll]);

  const tabs: { id: AdminTab; label: string; icon: typeof ShieldCheck }[] = [
    { id: 'overview', label: 'Overview', icon: ShieldCheck },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'teams', label: 'Teams', icon: UsersRound },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'results', label: 'Results', icon: Swords },
    { id: 'disputes', label: 'Disputes', icon: Scale },
    { id: 'organizers', label: 'Organizers', icon: UserPlus },
    { id: 'audit', label: 'Audit Log', icon: ScrollText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={28} className="text-dash-red-400" />
          <h2 className="font-dash-display text-3xl tracking-wide text-white">Admin Control Center</h2>
        </div>
        <p className="mt-1 text-sm text-dash-ink-300">Core administrative authority — users, teams, tournaments, disputes, organizers and audit records.</p>
      </div>

      {/* Sub-tab nav */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-dash-ink-700/60 bg-dash-ink-900/70 p-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-dash-red-600 text-white shadow-dash-glow' : 'text-dash-ink-300 hover:bg-dash-ink-800 hover:text-white'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? <Spinner /> : (
        <>
          {tab === 'overview' && <OverviewPanel players={players} disputes={disputes} organizers={organizers} auditLog={auditLog} teams={teams} tournaments={tournaments} onJump={setTab} />}
          {tab === 'users' && <UsersPanel players={players} onChange={loadAll} />}
          {tab === 'teams' && <TeamsPanel teams={teams} players={players} onChange={loadAll} />}
          {tab === 'tournaments' && <TournamentsAdminPanel tournaments={tournaments} onChange={loadAll} />}
          {tab === 'results' && <ResultsAdminPanel tournaments={tournaments} matches={matches} onChange={loadAll} />}
          {tab === 'disputes' && <DisputesPanel disputes={disputes} tournaments={tournaments} onChange={loadAll} />}
          {tab === 'organizers' && <OrganizersPanel organizers={organizers} onChange={loadAll} />}
          {tab === 'audit' && <AuditPanel auditLog={auditLog} />}
        </>
      )}
    </div>
  );
}

/* ================ OVERVIEW ================ */

function OverviewPanel({
  players, disputes, organizers, auditLog, teams, tournaments, onJump,
}: {
  players: Player[];
  disputes: Dispute[];
  organizers: Organizer[];
  auditLog: AuditEntry[];
  teams: Team[];
  tournaments: Tournament[];
  onJump: (t: AdminTab) => void;
}) {
  const suspended = players.filter((p) => p.is_suspended).length;
  const openDisputes = disputes.filter((d) => d.status !== 'closed').length;
  const escalatedDisputes = disputes.filter((d) => d.status === 'escalated').length;
  const activeOrganizers = organizers.filter((o) => o.is_active).length;
  const suspendedTeams = teams.filter((t) => t.status === 'suspended').length;
  const escalatedTournaments = tournaments.filter((t) => t.escalation_level !== 'none').length;
  const recentAudit = auditLog.slice(0, 6);

  const alerts: { label: string; value: number; tab: AdminTab; tone: string }[] = [
    { label: 'Suspended users', value: suspended, tab: 'users', tone: 'text-dash-red-400' },
    { label: 'Open disputes', value: openDisputes, tab: 'disputes', tone: 'text-dash-gold-400' },
    { label: 'Escalated disputes', value: escalatedDisputes, tab: 'disputes', tone: 'text-dash-red-400' },
    { label: 'Active organizers', value: activeOrganizers, tab: 'organizers', tone: 'text-green-400' },
    { label: 'Suspended teams', value: suspendedTeams, tab: 'teams', tone: 'text-dash-red-400' },
    { label: 'Escalated tournaments', value: escalatedTournaments, tab: 'tournaments', tone: 'text-dash-gold-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Alert cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {alerts.map((a) => (
          <button
            key={a.label}
            onClick={() => onJump(a.tab)}
            className="card card-hover p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-dash-ink-400">{a.label}</p>
              {a.value > 0 && <AlertTriangle size={14} className={a.tone} />}
            </div>
            <p className={`stat-value mt-1 ${a.value > 0 ? a.tone : 'text-dash-ink-200'}`}>{a.value}</p>
          </button>
        ))}
      </div>

      {/* Quick area summaries */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2"><Users size={18} className="text-dash-ink-300" /><h3 className="font-dash-display text-xl tracking-wide text-white">Users & Moderation</h3></div>
          <div className="space-y-2 text-sm">
            <Row label="Total registered players" value={players.length.toString()} />
            <Row label="Currently suspended" value={suspended.toString()} tone={suspended > 0 ? 'text-dash-red-400' : undefined} />
            <Row label="Suspended teams" value={suspendedTeams.toString()} tone={suspendedTeams > 0 ? 'text-dash-red-400' : undefined} />
          </div>
          <button onClick={() => onJump('users')} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-dash-red-400 hover:text-dash-red-300">
            Manage users <ChevronRight size={14} />
          </button>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2"><Scale size={18} className="text-dash-ink-300" /><h3 className="font-dash-display text-xl tracking-wide text-white">Disputes & Escalations</h3></div>
          <div className="space-y-2 text-sm">
            <Row label="Open cases" value={openDisputes.toString()} tone={openDisputes > 0 ? 'text-dash-gold-400' : undefined} />
            <Row label="Escalated" value={escalatedDisputes.toString()} tone={escalatedDisputes > 0 ? 'text-dash-red-400' : undefined} />
            <Row label="Closed (all time)" value={disputes.filter((d) => d.status === 'closed').length.toString()} />
          </div>
          <button onClick={() => onJump('disputes')} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-dash-red-400 hover:text-dash-red-300">
            Review disputes <ChevronRight size={14} />
          </button>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2"><UserPlus size={18} className="text-dash-ink-300" /><h3 className="font-dash-display text-xl tracking-wide text-white">Organizers</h3></div>
          <div className="space-y-2 text-sm">
            <Row label="Total organizers" value={organizers.length.toString()} />
            <Row label="Active" value={activeOrganizers.toString()} tone="text-green-400" />
            <Row label="Inactive" value={(organizers.length - activeOrganizers).toString()} tone={organizers.length - activeOrganizers > 0 ? 'text-dash-ink-300' : undefined} />
          </div>
          <button onClick={() => onJump('organizers')} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-dash-red-400 hover:text-dash-red-300">
            Manage organizers <ChevronRight size={14} />
          </button>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2"><ScrollText size={18} className="text-dash-ink-300" /><h3 className="font-dash-display text-xl tracking-wide text-white">Recent Audit Activity</h3></div>
          <div className="space-y-2">
            {recentAudit.length === 0 ? (
              <p className="text-sm text-dash-ink-400">No recent activity.</p>
            ) : recentAudit.map((a) => (
              <div key={a.id} className="flex items-start gap-2 text-xs">
                <span className="mt-0.5 rounded-sm bg-dash-ink-800 px-1.5 py-0.5 font-mono text-dash-gold-400">{a.action}</span>
                <div className="min-w-0">
                  <p className="text-dash-ink-200">{a.description}</p>
                  <p className="text-dash-ink-500">{a.actor} · {new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onJump('audit')} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-dash-red-400 hover:text-dash-red-300">
            View full audit log <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================ USERS ================ */

function UsersPanel({ players, onChange }: { players: Player[]; onChange: () => void }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'suspended' | 'active'>('all');
  const [acting, setActing] = useState<Player | null>(null);

  const filtered = players.filter((p) => {
    if (filter === 'suspended' && !p.is_suspended) return false;
    if (filter === 'active' && p.is_suspended) return false;
    if (search.trim() && !p.username.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-dash-display text-2xl tracking-wide text-white">User Management</h3>
          <p className="text-sm text-dash-ink-400">Suspend, reinstate, and review accounts according to policy.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-ink-400" />
            <input className="input pl-9 sm:w-52" placeholder="Search players…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1 rounded-lg border border-dash-ink-700/60 bg-dash-ink-950/60 p-1">
            {(['all', 'active', 'suspended'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-dash-red-600 text-white' : 'text-dash-ink-300 hover:text-white'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<Users size={36} />} title="No players match" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="card card-hover flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar url={p.avatar_url} name={p.username} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{p.username}</span>
                    {p.is_suspended && <SuspendedTag />}
                    <RankBadge rank={p.rank_tier} />
                  </div>
                  <p className="truncate text-xs text-dash-ink-400">
                    {p.is_suspended ? `Reason: ${p.suspension_reason || 'Not specified'}` : `${p.matches_played} matches · ${Number(p.kd_ratio).toFixed(2)} KD`}
                  </p>
                  {p.is_suspended && p.suspended_at && (
                    <p className="text-xs text-dash-ink-500">Suspended {new Date(p.suspended_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActing(p)}
                className={`btn ${p.is_suspended ? 'btn-gold' : 'btn-danger'} shrink-0`}
              >
                {p.is_suspended ? <><CheckCircle2 size={15} /> Reinstate</> : <><Ban size={15} /> Suspend</>}
              </button>
            </div>
          ))}
        </div>
      )}

      {acting && (
        <SuspendModal player={acting} onClose={() => setActing(null)} onDone={() => { setActing(null); onChange(); }} />
      )}
    </div>
  );
}

function SuspendModal({ player, onClose, onDone }: { player: Player; onClose: () => void; onDone: () => void }) {
  const isSuspend = !player.is_suspended;
  const [reason, setReason] = useState(player.suspension_reason);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    if (isSuspend) {
      await supabase.from('players').update({
        is_suspended: true,
        suspension_reason: reason,
        suspended_at: new Date().toISOString(),
      }).eq('id', player.id);
      await logAudit({ action: 'SUSPEND_PLAYER', entity_type: 'player', entity_id: player.username, description: `Player suspended: ${reason || 'no reason given'}` });
    } else {
      await supabase.from('players').update({
        is_suspended: false,
        suspension_reason: '',
        suspended_at: null,
      }).eq('id', player.id);
      await logAudit({ action: 'REINSTATE_PLAYER', entity_type: 'player', entity_id: player.username, description: 'Player reinstated — suspension lifted.' });
    }
    setSaving(false);
    onDone();
  };

  return (
    <Modal
      open onClose={onClose}
      title={isSuspend ? 'Suspend Account' : 'Reinstate Account'}
      subtitle={player.username}
      footer={<>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className={isSuspend ? 'btn-danger' : 'btn-gold'} onClick={submit} disabled={saving}>
          {saving ? 'Working…' : isSuspend ? <><Ban size={16} /> Confirm Suspension</> : <><CheckCircle2 size={16} /> Reinstate</>}
        </button>
      </>}
    >
      {isSuspend ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-dash-red-600/30 bg-dash-red-950/30 p-3 text-sm text-dash-red-300">
            <AlertTriangle size={16} className="mr-1 inline" /> Suspending this account will block them from platform activity. Record the policy reason below.
          </div>
          <div>
            <label className="label">Reason / Policy Reference</label>
            <textarea className="input min-h-[80px]" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Cheating violation flagged by anti-cheat system" />
          </div>
        </div>
      ) : (
        <p className="text-sm text-dash-ink-300">This will lift the suspension on <span className="font-semibold text-white">{player.username}</span> and clear the recorded reason. The action is logged to the audit trail.</p>
      )}
    </Modal>
  );
}

/* ================ TEAMS ================ */

function TeamsPanel({ teams, players, onChange }: { teams: Team[]; players: Player[]; onChange: () => void }) {
  const [selectedId, setSelected] = useState<string | null>(teams[0]?.id ?? null);
  const selected = teams.some((team) => team.id === selectedId)
    ? selectedId
    : teams[0]?.id ?? null;
  const [members, setMembers] = useState<TeamMembershipWithPlayer[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!selected) return;
    void Promise.resolve()
      .then(() => {
        setLoadingMembers(true);
        return supabase.from('team_memberships').select('*, player:players(id, username, avatar_url, is_suspended)').eq('team_id', selected);
      })
      .then(({ data }) => {
        setMembers((data as TeamMembershipWithPlayer[]) ?? []);
        setLoadingMembers(false);
      });
  }, [selected]);

  const setTeamStatus = async (team: Team, status: Team['status']) => {
    await supabase.from('teams').update({ status }).eq('id', team.id);
    await logAudit({ action: `TEAM_${status.toUpperCase()}`, entity_type: 'team', entity_id: team.name, description: `Team status set to ${status}.` });
    onChange();
  };

  const setMemberStatus = async (m: TeamMembershipWithPlayer, status: TeamMembershipWithPlayer['status']) => {
    await supabase.from('team_memberships').update({ status }).eq('id', m.id);
    await logAudit({ action: 'MEMBER_STATUS', entity_type: 'team_membership', entity_id: m.id, description: `Member ${m.player?.username ?? 'unknown'} set to ${status}.` });
    if (selected) {
      const { data } = await supabase.from('team_memberships').select('*, player:players(id, username, avatar_url, is_suspended)').eq('team_id', selected);
      setMembers((data as TeamMembershipWithPlayer[]) ?? []);
    }
  };

  const team = teams.find((t) => t.id === selected);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-dash-display text-2xl tracking-wide text-white">Team Records</h3>
        <p className="text-sm text-dash-ink-400">Review team records, membership issues, and suspend or reinstate teams.</p>
      </div>

      {teams.length === 0 ? (
        <div className="card"><EmptyState icon={<UsersRound size={36} />} title="No teams registered" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Team list */}
          <div className="space-y-2 lg:col-span-1">
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`card w-full p-3 text-left transition-all ${selected === t.id ? 'border-dash-red-600/50 shadow-dash-glow' : 'hover:border-dash-ink-600'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-dash-ink-400">[{t.tag}] · {t.country}</p>
                  </div>
                  <TeamStatusBadge status={t.status} />
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {team && (
              <div className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-dash-display text-2xl tracking-wide text-white">{team.name}</h4>
                    <p className="text-sm text-dash-ink-400">Tag [{team.tag}] · {team.country}</p>
                    <p className="mt-2 text-sm text-dash-ink-300">{team.description}</p>
                  </div>
                  <TeamStatusBadge status={team.status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => setTeamStatus(team, 'active')} className="btn-ghost text-xs"><CheckCircle2 size={14} /> Mark Active</button>
                  <button onClick={() => setTeamStatus(team, 'suspended')} className="btn-danger text-xs"><Ban size={14} /> Suspend</button>
                  <button onClick={() => setTeamStatus(team, 'disbanded')} className="btn-ghost text-xs"><Flag size={14} /> Mark Disbanded</button>
                  <button onClick={() => setShowAdd(true)} className="btn-gold text-xs">+ Add Member</button>
                </div>

                <div className="mt-5 border-t border-dash-ink-700/60 pt-4">
                  <h5 className="mb-3 font-dash-display text-lg tracking-wide text-white">Roster</h5>
                  {loadingMembers ? <Spinner size={20} /> : members.length === 0 ? (
                    <p className="text-sm text-dash-ink-400">No members recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between gap-2 rounded-lg border border-dash-ink-700/50 bg-dash-ink-950/40 p-3">
                          <div className="flex items-center gap-3">
                            <Avatar url={m.player?.avatar_url ?? null} name={m.player?.username ?? '?'} size={32} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">{m.player?.username ?? 'Unknown'}</span>
                                {m.player?.is_suspended && <SuspendedTag />}
                              </div>
                              <span className="text-xs text-dash-ink-400 capitalize">{m.role} · joined {new Date(m.joined_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${m.status === 'active' ? 'bg-green-600/15 text-green-400 border border-green-600/30' : m.status === 'benched' ? 'bg-dash-gold-500/15 text-dash-gold-400 border border-dash-gold-500/30' : 'bg-dash-ink-700/40 text-dash-ink-400 border border-dash-ink-600/40'}`}>{m.status}</span>
                            {m.status !== 'active' && <button onClick={() => setMemberStatus(m, 'active')} className="text-xs font-semibold text-green-400 hover:text-green-300">Activate</button>}
                            {m.status !== 'benched' && <button onClick={() => setMemberStatus(m, 'benched')} className="text-xs font-semibold text-dash-gold-400 hover:text-dash-gold-300">Bench</button>}
                            {m.status !== 'removed' && <button onClick={() => setMemberStatus(m, 'removed')} className="text-xs font-semibold text-dash-red-400 hover:text-dash-red-300">Remove</button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAdd && team && (
        <AddMemberModal team={team} players={players} onClose={() => setShowAdd(false)} onAdded={() => {
          setShowAdd(false);
          if (selected) {
            supabase.from('team_memberships').select('*, player:players(id, username, avatar_url, is_suspended)').eq('team_id', selected)
              .then(({ data }) => setMembers((data as TeamMembershipWithPlayer[]) ?? []));
          }
          onChange();
        }} />
      )}
    </div>
  );
}

function AddMemberModal({ team, players, onClose, onAdded }: { team: Team; players: Player[]; onClose: () => void; onAdded: () => void }) {
  const [playerId, setPlayerId] = useState('');
  const [role, setRole] = useState<'captain' | 'member' | 'coach'>('member');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!playerId) { setError('Select a player.'); return; }
    setSaving(true);
    const { error: insErr } = await supabase.from('team_memberships').insert({ team_id: team.id, player_id: playerId, role, status: 'active' });
    setSaving(false);
    if (insErr) { setError(insErr.code === '23505' ? 'Player is already on this team.' : insErr.message); return; }
    await logAudit({ action: 'ADD_MEMBER', entity_type: 'team', entity_id: team.name, description: `Added member to ${team.name}.` });
    onAdded();
  };

  return (
    <Modal open onClose={onClose} title="Add Member" subtitle={team.name}
      footer={<><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-gold" onClick={submit} disabled={saving || !playerId}>{saving ? 'Adding…' : <><Save size={16} /> Add</>}</button></>}>
      <div className="space-y-3">
        <div>
          <label className="label">Player</label>
          <select className="input" value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            <option value="">Select a player…</option>
            {players.map((p) => <option key={p.id} value={p.id}>{p.username}{p.is_suspended ? ' (suspended)' : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            <option value="captain">Captain</option><option value="member">Member</option><option value="coach">Coach</option>
          </select>
        </div>
        {error && <p className="text-sm text-dash-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

/* ================ TOURNAMENTS (admin) ================ */

function TournamentsAdminPanel({ tournaments, onChange }: { tournaments: Tournament[]; onChange: () => void }) {
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [escLevel, setEscLevel] = useState<Tournament['escalation_level']>('none');
  const [escNotes, setEscNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const open = (t: Tournament) => { setEditing(t); setEscLevel(t.escalation_level); setEscNotes(t.escalation_notes); };
  const save = async () => {
    if (!editing) return;
    setSaving(true);
    await supabase.from('tournaments').update({ escalation_level: escLevel, escalation_notes: escNotes }).eq('id', editing.id);
    await logAudit({ action: 'ESCALATE_TOURNAMENT', entity_type: 'tournament', entity_id: editing.name, description: `Escalation set to ${escLevel}. ${escNotes}` });
    setSaving(false); setEditing(null); onChange();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-dash-display text-2xl tracking-wide text-white">Tournament Administration</h3>
        <p className="text-sm text-dash-ink-400">Manage configuration, status, and escalation of tournaments.</p>
      </div>

      <div className="space-y-3">
        {tournaments.map((t) => (
          <div key={t.id} className="card card-hover p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <TournamentStatusBadge status={t.status} />
                  <EscalationBadge level={t.escalation_level} />
                  <span className="badge bg-dash-ink-800 text-dash-ink-300 border border-dash-ink-700">{t.game}</span>
                </div>
                <h4 className="font-dash-display text-xl tracking-wide text-white">{t.name}</h4>
                {t.escalation_level !== 'none' && <p className="mt-1 text-xs text-dash-gold-400">{t.escalation_notes}</p>}
              </div>
              <button onClick={() => open(t)} className="btn-ghost shrink-0 text-xs"><Pencil size={14} /> Manage</button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-dash-ink-700/60 pt-3 text-center text-xs text-dash-ink-400">
              <div><span className="block text-sm font-semibold text-dash-ink-100">{t.format}</span>Format</div>
              <div><span className="block text-sm font-semibold text-dash-ink-100">${Number(t.prize_pool).toLocaleString()}</span>Prize</div>
              <div><span className="block text-sm font-semibold text-dash-ink-100">{new Date(t.start_date).toLocaleDateString()}</span>Start</div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal open onClose={() => setEditing(null)} title="Manage Tournament" subtitle={editing.name}
          footer={<><button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : <><Save size={16} /> Save</>}</button></>}>
          <div className="space-y-4">
            <div>
              <label className="label">Escalation Level</label>
              <select className="input" value={escLevel} onChange={(e) => setEscLevel(e.target.value as Tournament['escalation_level'])}>
                <option value="none">None</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="label">Escalation Notes</label>
              <textarea className="input min-h-[80px]" value={escNotes} onChange={(e) => setEscNotes(e.target.value)} placeholder="Reason for escalation or admin notes…" />
            </div>
            <div className="rounded-lg border border-dash-ink-700/60 bg-dash-ink-950/40 p-3 text-xs text-dash-ink-400">
              <p>Tournament status: <span className="font-semibold text-dash-ink-200 capitalize">{editing.status}</span></p>
              <p>Prize pool: <span className="font-semibold text-dash-gold-400">${Number(editing.prize_pool).toLocaleString()}</span></p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================ RESULTS (audit / correct) ================ */

function ResultsAdminPanel({ tournaments, matches, onChange }: { tournaments: Tournament[]; matches: Match[]; onChange: () => void }) {
  const [filterT, setFilterT] = useState<string>('all');
  const [editing, setEditing] = useState<Match | null>(null);
  const [s1, setS1] = useState('');
  const [s2, setS2] = useState('');
  const [status, setStatus] = useState<Match['status']>('scheduled');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const list = matches.filter((m) => filterT === 'all' || m.tournament_id === filterT);

  const open = (m: Match) => { setEditing(m); setS1(m.score1?.toString() ?? ''); setS2(m.score2?.toString() ?? ''); setStatus(m.status); setNote(''); };
  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const sc1 = s1 === '' ? null : Number(s1);
    const sc2 = s2 === '' ? null : Number(s2);
    let winner = editing.winner;
    if (sc1 !== null && sc2 !== null) winner = sc1 > sc2 ? editing.player1 : sc2 > sc1 ? editing.player2 : null;
    await supabase.from('matches').update({ score1: sc1, score2: sc2, status, winner }).eq('id', editing.id);
    await logAudit({ action: 'CORRECT_RESULT', entity_type: 'match', entity_id: editing.id, description: `Result corrected: ${editing.player1} ${sc1 ?? '-'} vs ${sc2 ?? '-'} ${editing.player2}. ${note}` });
    setSaving(false); setEditing(null); onChange();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-dash-display text-2xl tracking-wide text-white">Results Audit</h3>
          <p className="text-sm text-dash-ink-400">Audit or correct authorized match records. Every correction is logged.</p>
        </div>
        <select className="input sm:w-64" value={filterT} onChange={(e) => setFilterT(e.target.value)}>
          <option value="all">All tournaments</option>
          {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <div className="card"><EmptyState icon={<Swords size={36} />} title="No matches" /></div>
      ) : (
        <div className="space-y-2">
          {list.map((m) => (
            <div key={m.id} className="card card-hover flex items-center justify-between gap-3 p-4">
              <div className="flex flex-1 items-center gap-3">
                <span className="rounded-md bg-dash-ink-800 px-2 py-0.5 text-xs font-bold text-dash-gold-400">R{m.round}</span>
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${m.winner === m.player1 ? 'text-dash-gold-400' : 'text-dash-ink-100'}`}>{m.player1} {m.score1 ?? ''}</span>
                  <span className="text-xs text-dash-ink-500">vs</span>
                  <span className={`text-sm font-semibold ${m.winner === m.player2 ? 'text-dash-gold-400' : 'text-dash-ink-100'}`}>{m.score2 ?? ''} {m.player2}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MatchStatusBadge status={m.status} />
                <button onClick={() => open(m)} className="btn-ghost text-xs"><Pencil size={14} /> Correct</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal open onClose={() => setEditing(null)} title="Audit / Correct Result" subtitle={`${editing.player1} vs ${editing.player2}`}
          footer={<><button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : <><Save size={16} /> Save Correction</>}</button></>}>
          <div className="space-y-4">
            <div className="rounded-lg border border-dash-gold-500/30 bg-dash-gold-500/5 p-3 text-xs text-dash-gold-400">
              <ShieldAlert size={14} className="mr-1 inline" /> This correction is recorded in the audit log with your notes.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">{editing.player1} Score</label><input type="number" min="0" className="input" value={s1} onChange={(e) => setS1(e.target.value)} /></div>
              <div><label className="label">{editing.player2} Score</label><input type="number" min="0" className="input" value={s2} onChange={(e) => setS2(e.target.value)} /></div>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value as Match['status'])}>
                <option value="scheduled">Scheduled</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="label">Audit Note (reason for correction)</label>
              <textarea className="input min-h-[70px]" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Score entry error — corrected per dispute DSP-2026-003" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================ DISPUTES ================ */

function DisputesPanel({ disputes, tournaments, onChange }: { disputes: Dispute[]; tournaments: Tournament[]; onChange: () => void }) {
  const [acting, setActing] = useState<Dispute | null>(null);
  const [action, setAction] = useState<'escalate' | 'close' | 'assign'>('escalate');
  const [resolution, setResolution] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [priority, setPriority] = useState<Dispute['priority']>('medium');
  const [saving, setSaving] = useState(false);

  const open = (d: Dispute, act: typeof action) => {
    setActing(d); setAction(act); setResolution(d.resolution); setAssignTo(d.assigned_to); setPriority(d.priority);
  };
  const submit = async () => {
    if (!acting) return;
    setSaving(true);
    const patch: Partial<Dispute> = { updated_at: new Date().toISOString() };
    let desc = '';
    if (action === 'escalate') { patch.status = 'escalated'; patch.priority = priority; desc = `Dispute escalated (priority ${priority}).`; }
    if (action === 'close') { patch.status = 'closed'; patch.resolution = resolution; desc = `Dispute closed. Resolution: ${resolution}`; }
    if (action === 'assign') { patch.assigned_to = assignTo; patch.status = acting.status === 'open' ? 'reviewing' : acting.status; desc = `Dispute assigned to ${assignTo}.`; }
    await supabase.from('disputes').update(patch).eq('id', acting.id);
    await logAudit({ action: action === 'close' ? 'CLOSE_DISPUTE' : action === 'escalate' ? 'ESCALATE_DISPUTE' : 'ASSIGN_DISPUTE', entity_type: 'dispute', entity_id: acting.case_number, description: desc });
    setSaving(false); setActing(null); onChange();
  };

  const tName = (id: string | null) => tournaments.find((t) => t.id === id)?.name ?? null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-dash-display text-2xl tracking-wide text-white">Dispute Cases</h3>
        <p className="text-sm text-dash-ink-400">Escalate, review, assign, and close cases.</p>
      </div>

      {disputes.length === 0 ? (
        <div className="card"><EmptyState icon={<Scale size={36} />} title="No disputes filed" /></div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="card card-hover p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-dash-gold-400">{d.case_number}</span>
                    <DisputeStatusBadge status={d.status} />
                    <PriorityPill priority={d.priority} />
                    {tName(d.related_tournament_id) && <span className="badge bg-dash-ink-800 text-dash-ink-300 border border-dash-ink-700">{tName(d.related_tournament_id)}</span>}
                  </div>
                  <h4 className="font-semibold text-white">{d.title}</h4>
                  <p className="mt-1 text-sm text-dash-ink-400">{d.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-dash-ink-500">
                    <span>Filed by: <span className="text-dash-ink-300">{d.filed_by}</span></span>
                    <span>Assigned: <span className="text-dash-ink-300">{d.assigned_to}</span></span>
                    <span>Updated: {new Date(d.updated_at).toLocaleDateString()}</span>
                  </div>
                  {d.resolution && <p className="mt-2 rounded-md bg-green-950/20 px-3 py-1.5 text-xs text-green-300">Resolution: {d.resolution}</p>}
                </div>
                {d.status !== 'closed' && (
                  <div className="flex shrink-0 gap-1.5">
                    <button onClick={() => open(d, 'assign')} className="btn-ghost text-xs"><Eye size={14} /> Assign</button>
                    <button onClick={() => open(d, 'escalate')} className="btn-danger text-xs"><Gavel size={14} /> Escalate</button>
                    <button onClick={() => open(d, 'close')} className="btn-gold text-xs"><CheckCircle2 size={14} /> Close</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {acting && (
        <Modal open onClose={() => setActing(null)}
          title={action === 'escalate' ? 'Escalate Case' : action === 'close' ? 'Close Case' : 'Assign Case'}
          subtitle={acting.case_number}
          footer={<><button className="btn-ghost" onClick={() => setActing(null)}>Cancel</button><button className={action === 'close' ? 'btn-gold' : 'btn-primary'} onClick={submit} disabled={saving}>{saving ? 'Saving…' : <><Save size={16} /> Confirm</>}</button></>}>
          <div className="space-y-4">
            <p className="text-sm text-dash-ink-300">{acting.title}</p>
            {action === 'escalate' && (
              <div>
                <label className="label">Priority</label>
                <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Dispute['priority'])}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
              </div>
            )}
            {action === 'close' && (
              <div>
                <label className="label">Resolution</label>
                <textarea className="input min-h-[80px]" value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Record the final resolution…" />
              </div>
            )}
            {action === 'assign' && (
              <div>
                <label className="label">Assign To</label>
                <input className="input" value={assignTo} onChange={(e) => setAssignTo(e.target.value)} placeholder="Admin name" />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================ ORGANIZERS ================ */

function OrganizersPanel({ organizers, onChange }: { organizers: Organizer[]; onChange: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [acting, setActing] = useState<Organizer | null>(null);

  const toggleActive = async (o: Organizer) => {
    await supabase.from('organizers').update({ is_active: !o.is_active }).eq('id', o.id);
    await logAudit({ action: o.is_active ? 'DEACTIVATE_ORGANIZER' : 'ACTIVATE_ORGANIZER', entity_type: 'organizer', entity_id: o.email, description: `Organizer ${o.first_name} ${o.last_name} ${o.is_active ? 'deactivated' : 'activated'}.` });
    onChange();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-dash-display text-2xl tracking-wide text-white">Organizer Accounts</h3>
          <p className="text-sm text-dash-ink-400">Add and manage organizer accounts for the platform.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><UserPlus size={18} /> Add Organizer</button>
      </div>

      {organizers.length === 0 ? (
        <div className="card"><EmptyState icon={<UserPlus size={36} />} title="No organizers" description="Add an organizer to give them access to the organizer console." /></div>
      ) : (
        <div className="space-y-2">
          {organizers.map((o) => (
            <div key={o.id} className="card card-hover flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br/srgb from-dash-red-600 to-dash-red-800 text-sm font-bold text-white">
                  {o.first_name[0]}{o.last_name[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{o.first_name} {o.last_name}</span>
                    <span className={`badge ${o.is_active ? 'bg-green-600/15 text-green-400 border border-green-600/30' : 'bg-dash-ink-700/40 text-dash-ink-400 border border-dash-ink-600/40'}`}>{o.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-dash-ink-400"><Mail size={12} /> {o.email}</div>
                  <p className="text-xs text-dash-ink-500">Added {new Date(o.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button onClick={() => setActing(o)} className="btn-ghost text-xs"><Pencil size={14} /> Edit</button>
                <button onClick={() => toggleActive(o)} className={`btn text-xs ${o.is_active ? 'btn-danger' : 'btn-gold'}`}>
                  {o.is_active ? <><Ban size={14} /> Deactivate</> : <><CheckCircle2 size={14} /> Activate</>}
                </button>
                <DeleteButton onConfirm={async () => {
                  await supabase.from('organizers').delete().eq('id', o.id);
                  await logAudit({ action: 'DELETE_ORGANIZER', entity_type: 'organizer', entity_id: o.email, description: `Organizer ${o.first_name} ${o.last_name} removed.` });
                  onChange();
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <OrganizerFormModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); onChange(); }} />}
      {acting && <OrganizerFormModal organizer={acting} onClose={() => setActing(null)} onSaved={() => { setActing(null); onChange(); }} />}
    </div>
  );
}

function OrganizerFormModal({ organizer, onClose, onSaved }: { organizer?: Organizer; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    first_name: organizer?.first_name ?? '',
    last_name: organizer?.last_name ?? '',
    email: organizer?.email ?? '',
    password: '',
    role: organizer?.role ?? 'organizer',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.first_name || !form.last_name || !form.email) { setError('First name, last name, and email are required.'); return; }
    setSaving(true);
    if (organizer) {
      const patch: Partial<Organizer> = { first_name: form.first_name, last_name: form.last_name, email: form.email, role: form.role };
      if (form.password) patch.password = form.password;
      const { error: updErr } = await supabase.from('organizers').update(patch).eq('id', organizer.id);
      setSaving(false);
      if (updErr) { setError(updErr.code === '23505' ? 'An organizer with this email already exists.' : updErr.message); return; }
      await logAudit({ action: 'UPDATE_ORGANIZER', entity_type: 'organizer', entity_id: form.email, description: `Organizer ${form.first_name} ${form.last_name} updated.` });
    } else {
      if (!form.password) { setSaving(false); setError('Password is required for new organizers.'); return; }
      const { error: insErr } = await supabase.from('organizers').insert({ first_name: form.first_name, last_name: form.last_name, email: form.email, password: form.password, role: form.role, is_active: true });
      setSaving(false);
      if (insErr) { setError(insErr.code === '23505' ? 'An organizer with this email already exists.' : insErr.message); return; }
      await logAudit({ action: 'ADD_ORGANIZER', entity_type: 'organizer', entity_id: form.email, description: `Organizer ${form.first_name} ${form.last_name} added.` });
    }
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title={organizer ? 'Edit Organizer' : 'Add Organizer'} subtitle={organizer ? organizer.email : 'Create a new organizer account'}
      footer={<><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={submit} disabled={saving || !form.first_name || !form.last_name || !form.email}>{saving ? 'Saving…' : <><Save size={16} /> {organizer ? 'Save Changes' : 'Add Organizer'}</>}</button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">First Name</label><input className="input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Marcus" /></div>
          <div><label className="label">Last Name</label><input className="input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Reed" /></div>
        </div>
        <div>
          <label className="label">Email</label>
          <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-ink-400" /><input type="email" className="input pl-9" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="organizer@agl.gg" /></div>
        </div>
        <div>
          <label className="label">{organizer ? 'New Password (leave blank to keep current)' : 'Password'}</label>
          <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-ink-400" /><input type="password" className="input pl-9" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={organizer ? '••••••••' : 'At least 6 characters'} minLength={organizer ? 0 : 6} /></div>
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="organizer">Organizer</option><option value="senior_organizer">Senior Organizer</option><option value="admin">Admin</option>
          </select>
        </div>
        {error && <p className="text-sm text-dash-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

/* ================ AUDIT LOG ================ */

function AuditPanel({ auditLog }: { auditLog: AuditEntry[] }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const types = [...new Set(auditLog.map((a) => a.entity_type))].sort();

  const filtered = auditLog.filter((a) => {
    if (filterType !== 'all' && a.entity_type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return a.action.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.actor.toLowerCase().includes(q) || a.entity_id.toLowerCase().includes(q);
    }
    return true;
  });

  const actionColor = (action: string) => {
    if (action.includes('SUSPEND') || action.includes('ESCALATE') || action.includes('FLAG')) return 'text-dash-red-400 bg-dash-red-600/10';
    if (action.includes('CLOSE') || action.includes('REINSTATE') || action.includes('ELIGIBLE')) return 'text-green-400 bg-green-600/10';
    if (action.includes('UPDATE') || action.includes('CORRECT')) return 'text-dash-gold-400 bg-dash-gold-500/10';
    return 'text-blue-400 bg-blue-600/10';
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-dash-display text-2xl tracking-wide text-white">Audit Log</h3>
        <p className="text-sm text-dash-ink-400">See who changed important updates and when.</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-ink-400" />
          <input className="input pl-9" placeholder="Search actions, descriptions, actors…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-48" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<ScrollText size={36} />} title="No audit entries" /></div>
      ) : (
        <div className="card divide-y divide-dash-ink-800/60">
          {filtered.map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-4">
              <div className="mt-0.5 rounded-lg bg-dash-ink-800 p-2 text-dash-ink-300"><Activity size={16} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold ${actionColor(a.action)}`}>{a.action}</span>
                  <span className="text-xs text-dash-ink-500">{a.entity_type}{a.entity_id ? ` · ${a.entity_id}` : ''}</span>
                </div>
                <p className="mt-1 text-sm text-dash-ink-200">{a.description}</p>
                <p className="mt-0.5 text-xs text-dash-ink-500">{a.actor} · {new Date(a.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================ SHARED ================ */

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-dash-ink-400">{label}</span>
      <span className={`font-semibold ${tone ?? 'text-dash-ink-100'}`}>{value}</span>
    </div>
  );
}

function Avatar({ url, name, size = 36 }: { url: string | null; name: string; size?: number }) {
  if (url) return <img src={url} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div className="flex items-center justify-center rounded-full bg-dash-ink-800 text-dash-ink-300" style={{ width: size, height: size }}>
      <CircleUser size={size * 0.6} />
    </div>
  );
}

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-dash-red-950/40 px-1 py-0.5">
        <button onClick={onConfirm} className="rounded-sm px-1.5 py-1 text-xs font-bold text-dash-red-400 hover:text-dash-red-300">Delete</button>
        <button onClick={() => setConfirming(false)} className="rounded-sm px-1.5 py-1 text-xs text-dash-ink-300 hover:text-white">No</button>
      </div>
    );
  }
  return (
    <button onClick={() => setConfirming(true)} className="rounded-lg p-2 text-dash-ink-300 hover:bg-dash-ink-800 hover:text-dash-red-400 transition-colors">
      <Trash2 size={16} />
    </button>
  );
}
