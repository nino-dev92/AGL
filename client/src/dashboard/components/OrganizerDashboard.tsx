import { useEffect, useState, useCallback } from 'react';
import {
  supabase,
  type Tournament,
  type Match,
  type Announcement,
  type Team,
  type TournamentRegistrationWithDetails,
} from '../lib/supabase';
import { Modal } from './Modal';
import { EmptyState, Spinner } from './Feedback';
import {
  TournamentStatusBadge,
  MatchStatusBadge,
  PriorityBadge,
} from './Badges';
import { TeamStatusBadge } from './AdminBadges';
import { LuPlus as Plus, LuTrophy as Trophy, LuSwords as Swords, LuMegaphone as Megaphone, LuCalendar as Calendar, LuDollarSign as DollarSign, LuUsers as Users, LuTrash2 as Trash2, LuPencil as Pencil, LuSave as Save, LuGamepad2 as Gamepad2, LuFlag as Flag, LuCircleDot as CircleDot, LuClipboardCheck as ClipboardCheck, LuCircleCheck as CheckCircle2, LuCircleX as XCircle, LuClock as Clock } from 'react-icons/lu';

type Tab = 'tournaments' | 'registrations' | 'results' | 'announcements';

export function OrganizerDashboard() {
  const [tab, setTab] = useState<Tab>('tournaments');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistrationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [t, m, a, tm, reg] = await Promise.all([
      supabase.from('tournaments').select('*').order('start_date', { ascending: true }),
      supabase.from('matches').select('*').order('scheduled_at', { ascending: true }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('teams').select('*').order('name'),
      supabase.from('tournament_registrations').select('*, tournament:tournaments(id, name, game, start_date), team:teams(id, name, tag, status)').order('registered_at', { ascending: false }),
    ]);
    setTournaments((t.data as Tournament[] | null) ?? []);
    setMatches((m.data as Match[] | null) ?? []);
    setAnnouncements((a.data as Announcement[] | null) ?? []);
    setTeams((tm.data as Team[] | null) ?? []);
    setRegistrations((reg.data as TournamentRegistrationWithDetails[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadAll);
  }, [loadAll]);

  const tabs: { id: Tab; label: string; icon: typeof Trophy }[] = [
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'registrations', label: 'Registrations', icon: ClipboardCheck },
    { id: 'results', label: 'Match Results', icon: Swords },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-dash-display text-3xl tracking-wide text-white">Organizer Console</h2>
          <p className="text-sm text-dash-ink-300">Create tournaments, record results, and broadcast updates.</p>
        </div>
        <div className="flex gap-2 rounded-lg border border-dash-ink-700/60 bg-dash-ink-900/70 p-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-dash-red-600 text-white shadow-dash-glow'
                    : 'text-dash-ink-300 hover:text-white hover:bg-dash-ink-800'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : tab === 'tournaments' ? (
        <TournamentsPanel tournaments={tournaments} matches={matches} onChange={loadAll} />
      ) : tab === 'registrations' ? (
        <RegistrationsPanel registrations={registrations} tournaments={tournaments} teams={teams} onChange={loadAll} />
      ) : tab === 'results' ? (
        <ResultsPanel tournaments={tournaments} matches={matches} teams={teams} onChange={loadAll} />
      ) : (
        <AnnouncementsPanel announcements={announcements} onChange={loadAll} />
      )}
    </div>
  );
}

/* ---------------- Tournaments ---------------- */

function TournamentsPanel({
  tournaments,
  matches,
  onChange,
}: {
  tournaments: Tournament[];
  matches: Match[];
  onChange: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tournament | null>(null);

  const ongoing = tournaments.filter((t) => t.status === 'ongoing').length;
  const totalPrize = tournaments.reduce((s, t) => s + Number(t.prize_pool), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Trophy} label="Total Tournaments" value={tournaments.length.toString()} accent="text-white" />
        <StatCard icon={CircleDot} label="Ongoing Now" value={ongoing.toString()} accent="text-dash-red-400" />
        <StatCard icon={DollarSign} label="Combined Prize Pool" value={`$${totalPrize.toLocaleString()}`} accent="text-dash-gold-400" />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-dash-display text-2xl tracking-wide text-white">All Tournaments</h3>
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus size={18} /> New Tournament
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Trophy size={40} />} title="No tournaments yet" description="Create your first tournament to get started." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tournaments.map((t) => {
            const matchCount = matches.filter((m) => m.tournament_id === t.id).length;
            return (
              <div key={t.id} className="card card-hover p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <TournamentStatusBadge status={t.status} />
                      <span className="badge bg-dash-ink-800 text-dash-ink-300 border border-dash-ink-700">
                        <Gamepad2 size={12} /> {t.game}
                      </span>
                    </div>
                    <h4 className="font-dash-display text-xl tracking-wide text-white">{t.name}</h4>
                    <p className="mt-1 line-clamp-2 text-sm text-dash-ink-400">{t.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => {
                        setEditing(t);
                        setShowForm(true);
                      }}
                      className="rounded-lg p-2 text-dash-ink-300 hover:bg-dash-ink-800 hover:text-dash-gold-400 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <DeleteButton
                      onConfirm={async () => {
                        await supabase.from('tournaments').delete().eq('id', t.id);
                        onChange();
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-dash-ink-700/60 pt-4 text-center">
                  <MiniStat icon={Calendar} label="Start" value={new Date(t.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                  <MiniStat icon={Users} label="Slots" value={`${matchCount}/${t.max_participants}`} />
                  <MiniStat icon={DollarSign} label="Prize" value={`$${Number(t.prize_pool).toLocaleString()}`} />
                </div>
                <div className="mt-3 text-xs text-dash-ink-400">Format: <span className="text-dash-ink-200">{t.format}</span></div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <TournamentFormModal
          tournament={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function TournamentFormModal({
  tournament,
  onClose,
  onSaved,
}: {
  tournament: Tournament | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: tournament?.name ?? '',
    game: tournament?.game ?? 'Valorant',
    format: tournament?.format ?? 'Single Elimination',
    status: tournament?.status ?? 'upcoming',
    start_date: tournament?.start_date ? tournament.start_date.slice(0, 16) : '',
    prize_pool: tournament?.prize_pool?.toString() ?? '0',
    description: tournament?.description ?? '',
    max_participants: tournament?.max_participants?.toString() ?? '16',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    const payload = {
      name: form.name,
      game: form.game,
      format: form.format,
      status: form.status as Tournament['status'],
      start_date: form.start_date ? new Date(form.start_date).toISOString() : new Date().toISOString(),
      prize_pool: Number(form.prize_pool) || 0,
      description: form.description,
      max_participants: Number(form.max_participants) || 16,
    };
    const res = tournament
      ? await supabase.from('tournaments').update(payload).eq('id', tournament.id)
      : await supabase.from('tournaments').insert(payload);
    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    onSaved();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={tournament ? 'Edit Tournament' : 'Create Tournament'}
      subtitle={tournament ? 'Update tournament details' : 'Set up a new competitive event'}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving || !form.name}>
            {saving ? 'Saving…' : (<><Save size={16} /> {tournament ? 'Save Changes' : 'Create'}</>)}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Tournament Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Agl Winter Championship" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Game</label>
            <select className="input" value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}>
              {['Valorant', 'Apex Legends', 'Counter-Strike 2', 'Call of Duty', 'League of Legends', 'Overwatch 2'].map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Format</label>
            <select className="input" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
              {['Single Elimination', 'Double Elimination', 'Round Robin', 'Swiss'].map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Tournament['status'] })}>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input type="datetime-local" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Prize Pool ($)</label>
            <input type="number" min="0" className="input" value={form.prize_pool} onChange={(e) => setForm({ ...form, prize_pool: e.target.value })} />
          </div>
          <div>
            <label className="label">Max Participants</label>
            <input type="number" min="2" className="input" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the tournament" />
        </div>
        {error && <p className="text-sm text-dash-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

/* ---------------- Registrations ---------------- */

function RegistrationsPanel({
  registrations,
  tournaments,
  onChange,
}: {
  registrations: TournamentRegistrationWithDetails[];
  tournaments: Tournament[];
  teams: Team[];
  onChange: () => void;
}) {
  const [filterT, setFilterT] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filtered = registrations.filter((r) => {
    if (filterT !== 'all' && r.tournament_id !== filterT) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const pending = registrations.filter((r) => r.status === 'pending').length;

  const review = async (reg: TournamentRegistrationWithDetails, status: 'approved' | 'rejected') => {
    await supabase.from('tournament_registrations').update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'Organizer',
    }).eq('id', reg.id);
    onChange();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-dash-display text-2xl tracking-wide text-white">Team Registrations</h3>
          <p className="text-sm text-dash-ink-400">Review team registration requests per tournament.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="input sm:w-56" value={filterT} onChange={(e) => setFilterT(e.target.value)}>
            <option value="all">All tournaments</option>
            {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="flex gap-1 rounded-lg border border-dash-ink-700/60 bg-dash-ink-950/60 p-1">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button key={f} onClick={() => setFilterStatus(f)} className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-all ${filterStatus === f ? 'bg-dash-red-600 text-white' : 'text-dash-ink-300 hover:text-white'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {pending > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-dash-gold-500/30 bg-dash-gold-500/5 px-4 py-3 text-sm text-dash-gold-400">
          <Clock size={16} /> {pending} registration{pending === 1 ? '' : 's'} awaiting review.
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<ClipboardCheck size={40} />} title="No registrations" description="Team registrations will appear here for review." /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="card card-hover p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <RegistrationStatusBadge status={r.status} />
                    {r.tournament && <span className="badge bg-dash-ink-800 text-dash-ink-300 border border-dash-ink-700">{r.tournament.name}</span>}
                    {r.team && <TeamStatusBadge status={r.team.status} />}
                  </div>
                  <h4 className="font-semibold text-white">{r.team?.name ?? 'Unknown team'} <span className="text-dash-ink-400">[{r.team?.tag}]</span></h4>
                  <p className="mt-1 text-xs text-dash-ink-400">
                    Registered {new Date(r.registered_at).toLocaleDateString()}
                    {r.reviewed_at && ` · Reviewed ${new Date(r.reviewed_at).toLocaleDateString()} by ${r.reviewed_by}`}
                  </p>
                  {r.notes && <p className="mt-1 text-sm text-dash-ink-300">{r.notes}</p>}
                </div>
                {r.status === 'pending' && (
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => review(r, 'approved')} className="btn-gold text-xs"><CheckCircle2 size={15} /> Approve</button>
                    <button onClick={() => review(r, 'rejected')} className="btn-danger text-xs"><XCircle size={15} /> Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RegistrationStatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const map = {
    pending: { label: 'Pending', cls: 'bg-dash-gold-500/15 text-dash-gold-400 border border-dash-gold-500/30', dot: 'bg-dash-gold-400' },
    approved: { label: 'Approved', cls: 'bg-green-600/15 text-green-400 border border-green-600/30', dot: 'bg-green-500' },
    rejected: { label: 'Rejected', cls: 'bg-dash-red-600/15 text-dash-red-400 border border-dash-red-600/30', dot: 'bg-dash-red-500' },
  } as const;
  const s = map[status];
  return (
    <span className={`badge ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/* ---------------- Results ---------------- */

function ResultsPanel({
  tournaments,
  matches,
  teams,
  onChange,
}: {
  tournaments: Tournament[];
  matches: Match[];
  teams: Team[];
  onChange: () => void;
}) {
  const [selectedTournamentId, setSelectedTournament] = useState<string>(tournaments[0]?.id ?? '');
  const selectedTournament = tournaments.some(
    (tournament) => tournament.id === selectedTournamentId,
  )
    ? selectedTournamentId
    : tournaments[0]?.id ?? '';
  const [showAdd, setShowAdd] = useState(false);

  const tournamentMatches = matches.filter((m) => m.tournament_id === selectedTournament);
  const tournament = tournaments.find((t) => t.id === selectedTournament);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTournament(t.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                selectedTournament === t.id
                  ? 'bg-dash-red-600 text-white shadow-dash-glow'
                  : 'bg-dash-ink-800 text-dash-ink-300 hover:text-white'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <button className="btn-gold" onClick={() => setShowAdd(true)} disabled={!selectedTournament}>
          <Plus size={18} /> Add Match
        </button>
      </div>

      {!tournament ? (
        <div className="card"><EmptyState icon={<Swords size={40} />} title="No tournaments available" description="Create a tournament first to manage matches." /></div>
      ) : tournamentMatches.length === 0 ? (
        <div className="card"><EmptyState icon={<Flag size={40} />} title="No matches scheduled" description="Add a match to start recording results." /></div>
      ) : (
        <div className="space-y-3">
          {tournamentMatches.map((m) => (
            <MatchResultRow key={m.id} match={m} onChange={onChange} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddMatchModal
          tournamentId={selectedTournament}
          teams={teams}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function MatchResultRow({ match, onChange }: { match: Match; onChange: () => void }) {
  const [editing, setEditing] = useState(false);
  const [s1, setS1] = useState(match.score1?.toString() ?? '');
  const [s2, setS2] = useState(match.score2?.toString() ?? '');
  const [status, setStatus] = useState<Match['status']>(match.status);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const sc1 = s1 === '' ? null : Number(s1);
    const sc2 = s2 === '' ? null : Number(s2);
    let winner: string | null = match.winner;
    if (sc1 !== null && sc2 !== null) {
      winner = sc1 > sc2 ? match.player1 : sc2 > sc1 ? match.player2 : null;
    }
    await supabase.from('matches').update({ score1: sc1, score2: sc2, status, winner }).eq('id', match.id);
    setSaving(false);
    setEditing(false);
    onChange();
  };

  return (
    <div className="card card-hover p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <span className="rounded-md bg-dash-ink-800 px-2 py-0.5 text-xs font-bold text-dash-gold-400">R{match.round}</span>
          <div className="flex flex-1 items-center justify-between gap-2">
            <PlayerSlot name={match.player1} score={match.score1} winner={match.winner === match.player1} />
            <span className="text-xs font-bold text-dash-ink-500">VS</span>
            <PlayerSlot name={match.player2} score={match.score2} winner={match.winner === match.player2} alignRight />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MatchStatusBadge status={match.status} />
          <button onClick={() => setEditing(!editing)} className="rounded-lg p-1.5 text-dash-ink-300 hover:bg-dash-ink-800 hover:text-dash-gold-400 transition-colors">
            <Pencil size={15} />
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-dash-ink-700/60 pt-4 animate-dash-slide-up">
          <div>
            <label className="label">{match.player1} Score</label>
            <input type="number" min="0" className="input w-28" value={s1} onChange={(e) => setS1(e.target.value)} />
          </div>
          <div>
            <label className="label">{match.player2} Score</label>
            <input type="number" min="0" className="input w-28" value={s2} onChange={(e) => setS2(e.target.value)} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as Match['status'])}>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}><Save size={16} /> Update Result</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerSlot({ name, score, winner, alignRight }: { name: string; score: number | null; winner: boolean; alignRight?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${alignRight ? 'flex-row-reverse text-right' : ''}`}>
      <span className={`text-sm font-semibold ${winner ? 'text-dash-gold-400' : 'text-dash-ink-100'}`}>{name}</span>
      {score !== null && (
        <span className={`font-dash-display text-xl ${winner ? 'text-dash-gold-400' : 'text-dash-ink-300'}`}>{score}</span>
      )}
      {winner && <Trophy size={14} className="text-dash-gold-400" />}
    </div>
  );
}

function AddMatchModal({ tournamentId, teams, onClose, onSaved }: { tournamentId: string; teams: Team[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ player1: '', player2: '', round: '1', scheduled_at: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.player1) {
      setError('Team 1 is required');
      return;
    }
    setSaving(true);
    const res = await supabase.from('matches').insert({
      tournament_id: tournamentId,
      player1: form.player1,
      player2: form.player2 || 'TBD',
      round: Number(form.round) || 1,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : new Date().toISOString(),
      status: 'scheduled',
    });
    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    onSaved();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Set Tournament Match"
      subtitle="Add a new match to the bracket"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-gold" onClick={submit} disabled={saving || !form.player1}>
            {saving ? 'Saving…' : (<><Plus size={16} /> Set Match</>)}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Team 1</label>
            <select className="input" value={form.player1} onChange={(e) => setForm({ ...form, player1: e.target.value })}>
              <option value="">Select team…</option>
              {teams.map((t) => <option key={t.id} value={t.name}>{t.name} [{t.tag}]</option>)}
              <option value="TBD">TBD</option>
            </select>
          </div>
          <div>
            <label className="label">Team 2</label>
            <select className="input" value={form.player2} onChange={(e) => setForm({ ...form, player2: e.target.value })}>
              <option value="">Select team…</option>
              {teams.map((t) => <option key={t.id} value={t.name}>{t.name} [{t.tag}]</option>)}
              <option value="TBD">TBD</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Round</label>
            <input type="number" min="1" className="input" value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })} />
          </div>
          <div>
            <label className="label">Scheduled At</label>
            <input type="datetime-local" className="input" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
          </div>
        </div>
        {error && <p className="text-sm text-dash-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

/* ---------------- Announcements ---------------- */

function AnnouncementsPanel({ announcements, onChange }: { announcements: Announcement[]; onChange: () => void }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-dash-display text-2xl tracking-wide text-white">Broadcast Updates</h3>
        <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={18} /> New Announcement</button>
      </div>

      {announcements.length === 0 ? (
        <div className="card"><EmptyState icon={<Megaphone size={40} />} title="No announcements" description="Post an update to keep players informed." /></div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="card card-hover p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <PriorityBadge priority={a.priority} />
                    <span className="text-xs text-dash-ink-400">{new Date(a.created_at).toLocaleString()}</span>
                    {!a.is_active && <span className="badge bg-dash-ink-800 text-dash-ink-400 border border-dash-ink-700">Archived</span>}
                  </div>
                  <h4 className="font-semibold text-white">{a.title}</h4>
                  <p className="mt-1 text-sm text-dash-ink-300">{a.body}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={async () => {
                      await supabase.from('announcements').update({ is_active: !a.is_active }).eq('id', a.id);
                      onChange();
                    }}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-dash-ink-300 hover:bg-dash-ink-800 hover:text-white transition-colors"
                  >
                    {a.is_active ? 'Archive' : 'Reactivate'}
                  </button>
                  <DeleteButton
                    onConfirm={async () => {
                      await supabase.from('announcements').delete().eq('id', a.id);
                      onChange();
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AnnouncementFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function AnnouncementFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', body: '', priority: 'info' as Announcement['priority'] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.title) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    const res = await supabase.from('announcements').insert({ title: form.title, body: form.body, priority: form.priority, is_active: true });
    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    onSaved();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="New Announcement"
      subtitle="Broadcast an update to all players"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving || !form.title}>
            {saving ? 'Publishing…' : (<><Megaphone size={16} /> Publish</>)}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Server maintenance notice" />
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Announcement['priority'] })}>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="input min-h-[100px]" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write the announcement details…" />
        </div>
        {error && <p className="text-sm text-dash-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

/* ---------------- Shared bits ---------------- */

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Trophy; label: string; value: string; accent: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dash-ink-400">{label}</p>
          <p className={`stat-value mt-1 ${accent}`}>{value}</p>
        </div>
        <div className="rounded-lg bg-dash-ink-800 p-2.5 text-dash-ink-300">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon size={14} className="text-dash-ink-400" />
      <span className="text-xs text-dash-ink-400">{label}</span>
      <span className="text-sm font-semibold text-dash-ink-100">{value}</span>
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
