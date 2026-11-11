import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  supabase,
  type Player,
  type Announcement,
  type Team,
  type Tournament,
  type TeamMembershipWithPlayer,
  type TournamentRegistrationWithDetails,
} from '../lib/supabase';
import { Modal } from './Modal';
import { EmptyState, Spinner } from './Feedback';
import {
  PlayerStatusBadge,
  RankBadge,
  PriorityBadge,
} from './Badges';
import { TeamStatusBadge } from './AdminBadges';
import { LuUsers as Users, LuActivity as Activity, LuTrendingUp as TrendingUp, LuCrosshair as Crosshair, LuSkull as Skull, LuCrown as Crown, LuSearch as Search, LuChevronUp as ChevronUp, LuChevronDown as ChevronDown, LuPencil as Pencil, LuSave as Save, LuMegaphone as Megaphone, LuCircleUser as CircleUser, LuWifi as Wifi, LuTriangleAlert as AlertTriangle, LuUsersRound as UsersRound, LuPlus as Plus, LuTrash2 as Trash2, LuTrophy as Trophy, LuSend as Send } from 'react-icons/lu';

type SortKey = 'username' | 'kd_ratio' | 'kills' | 'wins' | 'matches_played' | 'rank_tier';
type SortDir = 'asc' | 'desc';
type MgrTab = 'players' | 'teams';

export function ManagerDashboard() {
  const [tab, setTab] = useState<MgrTab>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistrationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'away' | 'offline'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('kd_ratio');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [editing, setEditing] = useState<Player | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [p, a, tm, tnt, reg] = await Promise.all([
      supabase.from('players').select('*').order('kd_ratio', { ascending: false }),
      supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(6),
      supabase.from('teams').select('*').order('name'),
      supabase.from('tournaments').select('*').order('start_date', { ascending: true }),
      supabase.from('tournament_registrations').select('*, tournament:tournaments(id, name, game, start_date), team:teams(id, name, tag, status)').order('registered_at', { ascending: false }),
    ]);
    setPlayers(p.data ?? []);
    setAnnouncements(a.data ?? []);
    setTeams(tm.data ?? []);
    setTournaments(tnt.data ?? []);
    setRegistrations((reg.data as TournamentRegistrationWithDetails[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onlineCount = players.filter((p) => p.status === 'online').length;
  const awayCount = players.filter((p) => p.status === 'away').length;
  const avgKd = players.length > 0 ? (players.reduce((s, p) => s + Number(p.kd_ratio), 0) / players.length).toFixed(2) : '0.00';
  const topPlayer = [...players].sort((a, b) => Number(b.kd_ratio) - Number(a.kd_ratio))[0];

  const filtered = useMemo(() => {
    let list = players;
    if (filter !== 'all') list = list.filter((p) => p.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.username.toLowerCase().includes(q) || p.rank_tier.toLowerCase().includes(q));
    }
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'username' || sortKey === 'rank_tier') {
        cmp = a[sortKey].localeCompare(b[sortKey]);
      } else {
        cmp = Number(a[sortKey]) - Number(b[sortKey]);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [players, filter, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-dash-display text-3xl tracking-wide text-white">Manager Command Center</h2>
          <p className="text-sm text-dash-ink-300">Monitor players, manage teams, and register for tournaments.</p>
        </div>
        <div className="flex gap-2 rounded-lg border border-dash-ink-700/60 bg-dash-ink-900/70 p-1">
          {(['players', 'teams'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition-all ${
                tab === t ? 'bg-dash-red-600 text-white shadow-dash-glow' : 'text-dash-ink-300 hover:text-white hover:bg-dash-ink-800'
              }`}
            >
              {t === 'players' ? <Users size={16} /> : <UsersRound size={16} />}
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'players' ? (
        <PlayersTab
          players={players}
          announcements={announcements}
          onlineCount={onlineCount}
          awayCount={awayCount}
          avgKd={avgKd}
          topPlayer={topPlayer}
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          sortKey={sortKey}
          sortDir={sortDir}
          toggleSort={toggleSort}
          filtered={filtered}
          editing={editing}
          setEditing={setEditing}
          loadAll={loadAll}
        />
      ) : (
        <TeamsTab teams={teams} players={players} tournaments={tournaments} registrations={registrations} onChange={loadAll} />
      )}
    </div>
  );
}

/* ================ PLAYERS TAB ================ */

function PlayersTab({
  players, announcements, onlineCount, awayCount, avgKd, topPlayer,
  search, setSearch, filter, setFilter, sortKey, sortDir, toggleSort, filtered,
  editing, setEditing, loadAll,
}: {
  players: Player[];
  announcements: Announcement[];
  onlineCount: number;
  awayCount: number;
  avgKd: string;
  topPlayer: Player | undefined;
  search: string;
  setSearch: (s: string) => void;
  filter: 'all' | 'online' | 'away' | 'offline';
  setFilter: (f: 'all' | 'online' | 'away' | 'offline') => void;
  sortKey: SortKey;
  sortDir: SortDir;
  toggleSort: (k: SortKey) => void;
  filtered: Player[];
  editing: Player | null;
  setEditing: (p: Player | null) => void;
  loadAll: () => void;
}) {
  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Wifi} label="Players Online" value={onlineCount.toString()} sub={`${awayCount} away`} accent="text-green-400" iconBg="bg-green-500/10 text-green-400" />
        <StatCard icon={Activity} label="Total Players" value={players.length.toString()} sub="registered" accent="text-white" iconBg="bg-dash-ink-800 text-dash-ink-200" />
        <StatCard icon={TrendingUp} label="Average KD" value={avgKd} sub="all players" accent="text-dash-gold-400" iconBg="bg-dash-gold-500/10 text-dash-gold-400" />
        <StatCard icon={Crown} label="Top Performer" value={topPlayer?.username ?? '—'} sub={`${topPlayer ? Number(topPlayer.kd_ratio).toFixed(2) : '0.00'} KD`} accent="text-dash-red-400" iconBg="bg-dash-red-600/10 text-dash-red-400" />
      </div>

      {/* Online players quick view */}
      <OnlineRoster players={players.filter((p) => p.is_online)} />

      {/* Players table */}
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-dash-ink-700/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-dash-display text-2xl tracking-wide text-white">Player Roster</h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-ink-400" />
              <input
                className="input pl-9 sm:w-56"
                placeholder="Search players…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 rounded-lg border border-dash-ink-700/60 bg-dash-ink-950/60 p-1">
              {(['all', 'online', 'away', 'offline'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                    filter === f ? 'bg-dash-red-600 text-white' : 'text-dash-ink-300 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Users size={40} />} title="No players found" description="Try adjusting your search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dash-ink-700/60 text-left text-xs uppercase tracking-wider text-dash-ink-400">
                  <Th label="Player" sortKey="username" current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3">Status</th>
                  <Th label="KD" sortKey="kd_ratio" current={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                  <Th label="Kills" sortKey="kills" current={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                  <Th label="Wins" sortKey="wins" current={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                  <Th label="Matches" sortKey="matches_played" current={sortKey} dir={sortDir} onSort={toggleSort} align="right" />
                  <Th label="Rank" sortKey="rank_tier" current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-dash-ink-800/50 transition-colors hover:bg-dash-ink-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar url={p.avatar_url} name={p.username} />
                        <span className="font-semibold text-white">{p.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><PlayerStatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <KdPill kd={Number(p.kd_ratio)} />
                    </td>
                    <td className="px-4 py-3 text-right text-dash-ink-100">{p.kills.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-green-400">{p.wins}</span>
                      <span className="text-dash-ink-500"> / </span>
                      <span className="text-dash-red-400">{p.losses}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-dash-ink-300">{p.matches_played}</td>
                    <td className="px-4 py-3"><RankBadge rank={p.rank_tier} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing(p)}
                        className="rounded-lg p-1.5 text-dash-ink-300 hover:bg-dash-ink-800 hover:text-dash-gold-400 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Updates feed */}
      <UpdatesFeed announcements={announcements} />

      {editing && (
        <EditPlayerModal
          player={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            loadAll();
          }}
        />
      )}
    </>
  );
}

/* ================ TEAMS TAB ================ */

function TeamsTab({
  teams, players, tournaments, registrations, onChange,
}: {
  teams: Team[];
  players: Player[];
  tournaments: Tournament[];
  registrations: TournamentRegistrationWithDetails[];
  onChange: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(teams[0]?.id ?? null);
  const [members, setMembers] = useState<TeamMembershipWithPlayer[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (!teams.length) return;
    if (!selected || !teams.find((t) => t.id === selected)) setSelected(teams[0].id);
  }, [teams, selected]);

  useEffect(() => {
    if (!selected) { setMembers([]); return; }
    setLoadingMembers(true);
    supabase.from('team_memberships').select('*, player:players(id, username, avatar_url, is_suspended)').eq('team_id', selected)
      .then(({ data }) => { setMembers((data as TeamMembershipWithPlayer[]) ?? []); setLoadingMembers(false); });
  }, [selected]);

  const team = teams.find((t) => t.id === selected);
  const teamRegs = registrations.filter((r) => r.team_id === selected);

  const removeMember = async (m: TeamMembershipWithPlayer) => {
    await supabase.from('team_memberships').delete().eq('id', m.id);
    if (selected) {
      const { data } = await supabase.from('team_memberships').select('*, player:players(id, username, avatar_url, is_suspended)').eq('team_id', selected);
      setMembers((data as TeamMembershipWithPlayer[]) ?? []);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-dash-display text-2xl tracking-wide text-white">Team Management</h3>
        <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={18} /> Create Team</button>
      </div>

      {teams.length === 0 ? (
        <div className="card"><EmptyState icon={<UsersRound size={40} />} title="No teams yet" description="Create a team to start managing players and registering for tournaments." /></div>
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
                    {team.description && <p className="mt-2 text-sm text-dash-ink-300">{team.description}</p>}
                  </div>
                  <TeamStatusBadge status={team.status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => setShowAddMember(true)} className="btn-gold text-xs"><Plus size={14} /> Add Player</button>
                  <button onClick={() => setShowRegister(true)} className="btn-ghost text-xs"><Trophy size={14} /> Register for Tournament</button>
                </div>

                {/* Roster */}
                <div className="mt-5 border-t border-dash-ink-700/60 pt-4">
                  <h5 className="mb-3 font-dash-display text-lg tracking-wide text-white">Roster ({members.length})</h5>
                  {loadingMembers ? <Spinner size={20} /> : members.length === 0 ? (
                    <p className="text-sm text-dash-ink-400">No players on this team yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between gap-2 rounded-lg border border-dash-ink-700/50 bg-dash-ink-950/40 p-3">
                          <div className="flex items-center gap-3">
                            <Avatar url={m.player?.avatar_url ?? null} name={m.player?.username ?? '?'} size={32} />
                            <div>
                              <span className="text-sm font-semibold text-white">{m.player?.username ?? 'Unknown'}</span>
                              <span className="ml-2 text-xs capitalize text-dash-ink-400">{m.role}</span>
                            </div>
                          </div>
                          <button onClick={() => removeMember(m)} className="rounded-lg p-1.5 text-dash-ink-300 hover:bg-dash-ink-800 hover:text-dash-red-400 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Registrations */}
                <div className="mt-5 border-t border-dash-ink-700/60 pt-4">
                  <h5 className="mb-3 font-dash-display text-lg tracking-wide text-white">Tournament Registrations</h5>
                  {teamRegs.length === 0 ? (
                    <p className="text-sm text-dash-ink-400">Not registered for any tournaments.</p>
                  ) : (
                    <div className="space-y-2">
                      {teamRegs.map((r) => (
                        <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-dash-ink-700/50 bg-dash-ink-950/40 p-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{r.tournament?.name ?? 'Unknown tournament'}</p>
                            <p className="text-xs text-dash-ink-400">Registered {new Date(r.registered_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`badge ${r.status === 'approved' ? 'bg-green-600/15 text-green-400 border border-green-600/30' : r.status === 'pending' ? 'bg-dash-gold-500/15 text-dash-gold-400 border border-dash-gold-500/30' : 'bg-dash-red-600/15 text-dash-red-400 border border-dash-red-600/30'}`}>{r.status}</span>
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

      {showCreate && (
        <CreateTeamModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); onChange(); }} />
      )}
      {showAddMember && team && (
        <AddPlayerToTeamModal team={team} players={players} onClose={() => setShowAddMember(false)} onAdded={() => {
          setShowAddMember(false);
          if (selected) {
            supabase.from('team_memberships').select('*, player:players(id, username, avatar_url, is_suspended)').eq('team_id', selected)
              .then(({ data }) => setMembers((data as TeamMembershipWithPlayer[]) ?? []));
          }
          onChange();
        }} />
      )}
      {showRegister && team && (
        <RegisterTournamentModal team={team} tournaments={tournaments} registrations={teamRegs} onClose={() => setShowRegister(false)} onSaved={() => { setShowRegister(false); onChange(); }} />
      )}
    </div>
  );
}

function CreateTeamModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', tag: '', country: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.name) { setError('Team name is required.'); return; }
    setSaving(true);
    const { error: insErr } = await supabase.from('teams').insert({
      name: form.name, tag: form.tag, country: form.country, description: form.description, status: 'active',
    });
    setSaving(false);
    if (insErr) { setError(insErr.message); return; }
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title="Create Team" subtitle="Register a new team on the platform"
      footer={<><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={submit} disabled={saving || !form.name}>{saving ? 'Creating…' : <><Save size={16} /> Create Team</>}</button></>}>
      <div className="space-y-4">
        <div><label className="label">Team Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Vortex Esports" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Tag</label><input className="input" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="VTX" /></div>
          <div><label className="label">Country</label><input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="USA" /></div>
        </div>
        <div><label className="label">Description</label><textarea className="input min-h-[70px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief team description" /></div>
        {error && <p className="text-sm text-dash-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

function AddPlayerToTeamModal({ team, players, onClose, onAdded }: { team: Team; players: Player[]; onClose: () => void; onAdded: () => void }) {
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
    onAdded();
  };

  return (
    <Modal open onClose={onClose} title="Add Player" subtitle={team.name}
      footer={<><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-gold" onClick={submit} disabled={saving || !playerId}>{saving ? 'Adding…' : <><Plus size={16} /> Add Player</>}</button></>}>
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

function RegisterTournamentModal({ team, tournaments, registrations, onClose, onSaved }: { team: Team; tournaments: Tournament[]; registrations: TournamentRegistrationWithDetails[]; onClose: () => void; onSaved: () => void }) {
  const [tournamentId, setTournamentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const alreadyRegistered = new Set(registrations.map((r) => r.tournament_id));
  const available = tournaments.filter((t) => t.status !== 'completed' && !alreadyRegistered.has(t.id));

  const submit = async () => {
    if (!tournamentId) { setError('Select a tournament.'); return; }
    setSaving(true);
    const { error: insErr } = await supabase.from('tournament_registrations').insert({ tournament_id: tournamentId, team_id: team.id, status: 'pending' });
    setSaving(false);
    if (insErr) { setError(insErr.message); return; }
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title="Register for Tournament" subtitle={team.name}
      footer={<><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={submit} disabled={saving || !tournamentId}>{saving ? 'Submitting…' : <><Send size={16} /> Submit Registration</>}</button></>}>
      <div className="space-y-3">
        {available.length === 0 ? (
          <p className="text-sm text-dash-ink-400">No upcoming or ongoing tournaments available to register for, or this team is already registered for all of them.</p>
        ) : (
          <div>
            <label className="label">Tournament</label>
            <select className="input" value={tournamentId} onChange={(e) => setTournamentId(e.target.value)}>
              <option value="">Select a tournament…</option>
              {available.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.game}</option>)}
            </select>
            <p className="mt-2 text-xs text-dash-ink-500">Registration will be submitted as pending for organizer review.</p>
          </div>
        )}
        {error && <p className="text-sm text-dash-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

/* ---------------- Online roster strip ---------------- */

function OnlineRoster({ players }: { players: Player[] }) {
  if (players.length === 0) return null;
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-dash-pulse-dot" />
        <h3 className="font-dash-display text-xl tracking-wide text-white">Logged In Now</h3>
        <span className="badge bg-green-500/15 text-green-400 border border-green-500/30">{players.length} active</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {players.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded-lg border border-dash-ink-700/60 bg-dash-ink-950/40 px-3 py-1.5 transition-colors hover:border-dash-red-600/40">
            <Avatar url={p.avatar_url} name={p.username} size={28} />
            <span className="text-sm font-semibold text-white">{p.username}</span>
            <span className="text-xs text-dash-ink-400">{Number(p.kd_ratio).toFixed(2)} KD</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Updates feed ---------------- */

function UpdatesFeed({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Megaphone size={20} className="text-dash-red-400" />
        <h3 className="font-dash-display text-2xl tracking-wide text-white">Important Updates</h3>
      </div>
      {announcements.length === 0 ? (
        <EmptyState icon={<AlertTriangle size={36} />} title="No active updates" description="Announcements from the organizer will appear here." />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="flex gap-3 rounded-lg border border-dash-ink-700/50 bg-dash-ink-950/40 p-3">
              <div className="mt-0.5">
                {a.priority === 'critical' ? <AlertTriangle size={18} className="text-dash-red-400" /> : <Megaphone size={18} className="text-dash-ink-400" />}
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={a.priority} />
                  <span className="text-xs text-dash-ink-400">{new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="font-semibold text-white">{a.title}</p>
                <p className="mt-0.5 text-sm text-dash-ink-300">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Edit player modal ---------------- */

function EditPlayerModal({ player, onClose, onSaved }: { player: Player; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    username: player.username,
    status: player.status,
    kills: player.kills.toString(),
    deaths: player.deaths.toString(),
    wins: player.wins.toString(),
    losses: player.losses.toString(),
    matches_played: player.matches_played.toString(),
    rank_tier: player.rank_tier,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    const res = await supabase.from('players').update({
      username: form.username,
      status: form.status as Player['status'],
      is_online: form.status === 'online',
      kills: Number(form.kills) || 0,
      deaths: Number(form.deaths) || 0,
      wins: Number(form.wins) || 0,
      losses: Number(form.losses) || 0,
      matches_played: Number(form.matches_played) || 0,
      rank_tier: form.rank_tier,
      last_seen: new Date().toISOString(),
    }).eq('id', player.id);
    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    onSaved();
  };

  const computedKd = (() => {
    const k = Number(form.kills) || 0;
    const d = Number(form.deaths) || 0;
    return d === 0 ? k.toFixed(2) : (k / d).toFixed(2);
  })();

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Player"
      subtitle={player.username}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving}><Save size={16} /> Save</button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar url={player.avatar_url} name={form.username} size={56} />
          <div>
            <p className="text-sm text-dash-ink-400">Live KD preview</p>
            <p className="font-dash-display text-2xl text-dash-gold-400">{computedKd}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Username</label>
            <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Player['status'] })}>
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label"><Crosshair size={12} className="inline" /> Kills</label>
            <input type="number" min="0" className="input" value={form.kills} onChange={(e) => setForm({ ...form, kills: e.target.value })} />
          </div>
          <div>
            <label className="label"><Skull size={12} className="inline" /> Deaths</label>
            <input type="number" min="0" className="input" value={form.deaths} onChange={(e) => setForm({ ...form, deaths: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Wins</label>
            <input type="number" min="0" className="input" value={form.wins} onChange={(e) => setForm({ ...form, wins: e.target.value })} />
          </div>
          <div>
            <label className="label">Losses</label>
            <input type="number" min="0" className="input" value={form.losses} onChange={(e) => setForm({ ...form, losses: e.target.value })} />
          </div>
          <div>
            <label className="label">Matches</label>
            <input type="number" min="0" className="input" value={form.matches_played} onChange={(e) => setForm({ ...form, matches_played: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Rank Tier</label>
          <select className="input" value={form.rank_tier} onChange={(e) => setForm({ ...form, rank_tier: e.target.value })}>
            {['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        {error && <p className="text-sm text-dash-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

/* ---------------- Shared bits ---------------- */

function StatCard({ icon: Icon, label, value, sub, accent, iconBg }: { icon: typeof Users; label: string; value: string; sub: string; accent: string; iconBg: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-ink-400">{label}</p>
          <p className={`stat-value mt-1 truncate ${accent}`}>{value}</p>
          <p className="mt-0.5 text-xs text-dash-ink-500">{sub}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${iconBg}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function Th({ label, sortKey, current, dir, onSort, align = 'left' }: { label: string; sortKey: SortKey; current: SortKey; dir: SortDir; onSort: (k: SortKey) => void; align?: 'left' | 'right' }) {
  const active = current === sortKey;
  return (
    <th className={`px-4 py-3 ${align === 'right' ? 'text-right' : ''}`}>
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wider transition-colors ${active ? 'text-dash-red-400' : 'text-dash-ink-400 hover:text-dash-ink-200'}`}
      >
        {label}
        {active && (dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </button>
    </th>
  );
}

function KdPill({ kd }: { kd: number }) {
  const cls = kd >= 2 ? 'text-dash-gold-400 bg-dash-gold-500/10 border-dash-gold-500/30' : kd >= 1 ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-dash-red-400 bg-dash-red-600/10 border-dash-red-600/30';
  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-sm font-bold ${cls}`}>{kd.toFixed(2)}</span>;
}

function Avatar({ url, name, size = 36 }: { url: string | null; name: string; size?: number }) {
  if (url) {
    return <img src={url} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <div className="flex items-center justify-center rounded-full bg-dash-ink-800 text-dash-ink-300" style={{ width: size, height: size }}>
      <CircleUser size={size * 0.6} />
    </div>
  );
}
