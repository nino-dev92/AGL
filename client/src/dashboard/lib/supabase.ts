/* =====================================================================
   In-memory stand-in for Supabase (frontend only).

   The dashboard screens were written against Supabase, so this file
   mimics the small part of its API they use:
     supabase.from(table).select(...).eq(...).order(...).limit(...)
     .insert(...)  .update(...).eq(...)  .delete().eq(...)
   Data lives in memory and resets when the page is refreshed.

   When the real API is ready, replace the body of this file (keep the
   exported types) and the screens will not need to change.
   ===================================================================== */

/** Set to false to start with an empty database and see the empty states. */
const SEED_SAMPLE_DATA = true;

/* ---------------------------- Types (from Bolt) ---------------------------- */
export type Player = {
  id: string;
  username: string;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'away';
  is_online: boolean;
  kills: number;
  deaths: number;
  wins: number;
  losses: number;
  matches_played: number;
  kd_ratio: number;
  rank_tier: string;
  last_seen: string;
  created_at: string;
  is_suspended: boolean;
  suspension_reason: string;
  suspended_at: string | null;
};

export type Tournament = {
  id: string;
  name: string;
  game: string;
  format: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  start_date: string;
  prize_pool: number;
  description: string;
  max_participants: number;
  created_at: string;
  escalation_level: 'none' | 'low' | 'medium' | 'high';
  escalation_notes: string;
};

export type Match = {
  id: string;
  tournament_id: string;
  round: number;
  player1: string;
  player2: string;
  score1: number | null;
  score2: number | null;
  winner: string | null;
  status: 'scheduled' | 'ongoing' | 'completed';
  scheduled_at: string;
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  priority: 'info' | 'warning' | 'critical';
  is_active: boolean;
  created_at: string;
};

export type Team = {
  id: string;
  name: string;
  tag: string;
  country: string;
  status: 'active' | 'suspended' | 'disbanded';
  description: string;
  created_at: string;
};

export type TeamMembership = {
  id: string;
  team_id: string;
  player_id: string;
  role: 'captain' | 'member' | 'coach';
  status: 'active' | 'benched' | 'removed';
  joined_at: string;
};

export type TeamMembershipWithPlayer = TeamMembership & {
  player: Pick<Player, 'id' | 'username' | 'avatar_url' | 'is_suspended'> | null;
};

export type Dispute = {
  id: string;
  case_number: string;
  title: string;
  description: string;
  status: 'open' | 'reviewing' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  related_tournament_id: string | null;
  related_match_id: string | null;
  filed_by: string;
  assigned_to: string;
  resolution: string;
  created_at: string;
  updated_at: string;
};

export type AuditEntry = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  actor: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type PlatformSetting = {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  updated_at: string;
  updated_by: string;
};

export type StakingRecord = {
  id: string;
  entity_type: 'tournament' | 'player' | 'team';
  entity_name: string;
  stake_amount: number;
  status: 'eligible' | 'pending' | 'flagged' | 'escalated';
  eligibility_notes: string;
  created_at: string;
};

export type TournamentRegistration = {
  id: string;
  tournament_id: string;
  team_id: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
  registered_at: string;
  reviewed_at: string | null;
  reviewed_by: string;
};

export type TournamentRegistrationWithDetails = TournamentRegistration & {
  tournament: Pick<Tournament, 'id' | 'name' | 'game' | 'start_date'> | null;
  team: Pick<Team, 'id' | 'name' | 'tag' | 'status'> | null;
};

export type Organizer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

/* ------------------------------ The database ------------------------------ */
type Row = Record<string, any>;
type DbError = { message: string; code?: string };
type Result = { data: any; error: DbError | null };

const db: Record<string, Row[]> = {
  players: [],
  tournaments: [],
  matches: [],
  announcements: [],
  teams: [],
  team_memberships: [],
  tournament_registrations: [],
  disputes: [],
  organizers: [],
  audit_log: [],
};

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

/** Column defaults, like the defaults on the real tables. */
function withDefaults(table: string, row: Row): Row {
  const t = now();
  switch (table) {
    case 'players':
      return { avatar_url: null, status: 'offline', kills: 0, deaths: 0, wins: 0, losses: 0, matches_played: 0, rank_tier: 'Unranked', last_seen: t, created_at: t, is_suspended: false, suspension_reason: '', suspended_at: null, ...row };
    case 'tournaments':
      return { description: '', escalation_level: 'none', escalation_notes: '', created_at: t, ...row };
    case 'matches':
      return { score1: null, score2: null, winner: null, status: 'scheduled', created_at: t, ...row };
    case 'announcements':
      return { is_active: true, created_at: t, ...row };
    case 'teams':
      return { status: 'active', description: '', created_at: t, ...row };
    case 'team_memberships':
      return { status: 'active', joined_at: t, ...row };
    case 'tournament_registrations':
      return { status: 'pending', notes: '', registered_at: t, reviewed_at: null, reviewed_by: '', ...row };
    case 'disputes':
      return { status: 'open', priority: 'medium', related_tournament_id: null, related_match_id: null, assigned_to: 'Unassigned', resolution: '', created_at: t, updated_at: t, ...row };
    case 'organizers':
      return { is_active: true, created_at: t, ...row };
    case 'audit_log':
      return { metadata: {}, created_at: t, ...row };
    default:
      return row;
  }
}

/** Generated columns (kd_ratio and is_online are computed by the real table). */
function withGenerated(table: string, row: Row): Row {
  if (table !== 'players') return row;
  const kills = Number(row.kills) || 0;
  const deaths = Number(row.deaths) || 0;
  return {
    ...row,
    kd_ratio: deaths === 0 ? kills : Math.round((kills / deaths) * 100) / 100,
    is_online: row.status === 'online',
  };
}

/** Unique constraints. Returns the same error code Postgres uses. */
function violatesUnique(table: string, row: Row, others: Row[]): DbError | null {
  const dup = (fn: (o: Row) => boolean) => others.some(fn);
  const err = { code: '23505', message: 'duplicate key value violates unique constraint' };
  if (table === 'team_memberships' && dup((o) => o.team_id === row.team_id && o.player_id === row.player_id)) return err;
  if (table === 'tournament_registrations' && dup((o) => o.tournament_id === row.tournament_id && o.team_id === row.team_id)) return err;
  if (table === 'organizers' && dup((o) => String(o.email).toLowerCase() === String(row.email).toLowerCase())) return err;
  return null;
}

const compare = (a: any, b: any) => {
  if (a === b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
};

/** Column list plus joined tables, e.g. "*, player:players(id, username)" */
function project(row: Row, cols: string): Row {
  const embeds = [...cols.matchAll(/(\w+):(\w+)\(([^)]*)\)/g)];
  const plain = cols
    .replace(/(\w+):(\w+)\(([^)]*)\)/g, '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  const out: Row = plain.includes('*') || plain.length === 0 ? { ...row } : {};
  for (const c of plain) if (c !== '*') out[c] = row[c];

  for (const [, alias, relTable, relCols] of embeds) {
    const related = (db[relTable] ?? []).find((r) => r.id === row[`${alias}_id`]);
    if (!related) {
      out[alias] = null;
    } else {
      const picked: Row = {};
      for (const c of relCols.split(',').map((x) => x.trim()).filter(Boolean)) picked[c] = related[c];
      out[alias] = picked;
    }
  }
  return out;
}

class Query implements PromiseLike<Result> {
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private cols = '*';
  private filters: Array<[string, unknown]> = [];
  private ordering: { col: string; asc: boolean } | null = null;
  private max: number | null = null;
  private payload: Row | Row[] | null = null;
  private returning = false;
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  select(cols = '*') {
    this.cols = cols;
    this.returning = true;
    return this;
  }
  insert(payload: Row | Row[]) {
    this.op = 'insert';
    this.payload = payload;
    return this;
  }
  update(payload: Row) {
    this.op = 'update';
    this.payload = payload;
    return this;
  }
  delete() {
    this.op = 'delete';
    return this;
  }
  eq(col: string, value: unknown) {
    this.filters.push([col, value]);
    return this;
  }
  order(col: string, opts: { ascending?: boolean } = {}) {
    this.ordering = { col, asc: opts.ascending ?? true };
    return this;
  }
  limit(n: number) {
    this.max = n;
    return this;
  }

  then<T1 = Result, T2 = never>(
    onfulfilled?: ((value: Result) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null,
  ): PromiseLike<T1 | T2> {
    return Promise.resolve()
      .then(() => this.run())
      .then(onfulfilled, onrejected);
  }

  private run(): Result {
    const rows = db[this.table];
    if (!rows) return { data: null, error: { message: `Unknown table "${this.table}"` } };
    const matches = (r: Row) => this.filters.every(([c, v]) => r[c] === v);

    if (this.op === 'insert') {
      const list = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      const created: Row[] = [];
      for (const p of list) {
        const row = withGenerated(this.table, withDefaults(this.table, { id: uid(), ...p }));
        const err = violatesUnique(this.table, row, rows);
        if (err) return { data: null, error: err };
        rows.push(row);
        created.push(row);
      }
      return { data: this.returning ? created.map((r) => project(r, this.cols)) : null, error: null };
    }

    if (this.op === 'update') {
      const targets = rows.filter(matches);
      const updated: Row[] = [];
      for (const r of targets) {
        const next = withGenerated(this.table, { ...r, ...(this.payload as Row) });
        const err = violatesUnique(this.table, next, rows.filter((x) => x !== r));
        if (err) return { data: null, error: err };
        updated.push(next);
      }
      targets.forEach((r, i) => Object.assign(r, updated[i]));
      return { data: this.returning ? targets.map((r) => project(r, this.cols)) : null, error: null };
    }

    if (this.op === 'delete') {
      const keep = rows.filter((r) => !matches(r));
      rows.length = 0;
      rows.push(...keep);
      return { data: null, error: null };
    }

    let out = rows.filter(matches);
    if (this.ordering) {
      const { col, asc } = this.ordering;
      out = [...out].sort((a, b) => (asc ? 1 : -1) * compare(a[col], b[col]));
    }
    if (this.max !== null) out = out.slice(0, this.max);
    return { data: out.map((r) => project(r, this.cols)), error: null };
  }
}

export const supabase = {
  from: (table: string) => new Query(table),
};

/* ------------------------------ Sample data ------------------------------ */
function seed() {
  const P = (id: string, username: string, status: Player['status'], kills: number, deaths: number, wins: number, losses: number, matches_played: number, rank_tier: string, extra: Partial<Player> = {}) =>
    withGenerated('players', withDefaults('players', { id, username, status, kills, deaths, wins, losses, matches_played, rank_tier, created_at: '2026-08-01T09:00:00.000Z', ...extra }));

  db.players.push(
    P('p1', 'Zayn', 'online', 1840, 720, 58, 21, 79, 'Master'),
    P('p2', 'Blaze', 'online', 1520, 810, 47, 30, 77, 'Diamond'),
    P('p3', 'Phantom', 'away', 1210, 905, 39, 34, 73, 'Platinum'),
    P('p4', 'Nexus', 'online', 980, 640, 33, 19, 52, 'Diamond'),
    P('p5', 'Viper', 'offline', 760, 830, 22, 31, 53, 'Gold'),
    P('p6', 'Rogue', 'offline', 640, 700, 18, 24, 42, 'Gold'),
    P('p7', 'Kito', 'away', 530, 410, 20, 12, 32, 'Silver'),
    P('p8', 'Daze', 'online', 310, 450, 9, 17, 26, 'Bronze'),
    P('p9', 'Ghost', 'offline', 120, 210, 4, 11, 15, 'Bronze', { is_suspended: true, suspension_reason: 'Cheating violation flagged by anti-cheat system', suspended_at: '2026-10-27T10:00:00.000Z' }),
    P('p10', 'NewBlood', 'offline', 0, 0, 0, 0, 0, 'Unranked'),
  );

  db.teams.push(
    withDefaults('teams', { id: 'tm1', name: 'Vortex Esports', tag: 'VTX', country: 'Nigeria', status: 'active', description: 'Lagos-based competitive squad with three seasons of experience.', created_at: '2026-08-01T09:00:00.000Z' }),
    withDefaults('teams', { id: 'tm2', name: 'Lagos Legends', tag: 'LGL', country: 'Nigeria', status: 'active', description: 'Open roster team focused on tactical shooters.', created_at: '2026-08-05T09:00:00.000Z' }),
    withDefaults('teams', { id: 'tm3', name: 'Accra Alpha', tag: 'ACA', country: 'Ghana', status: 'active', description: 'Rising Ghanaian team.', created_at: '2026-08-20T09:00:00.000Z' }),
    withDefaults('teams', { id: 'tm4', name: 'Nairobi Nexus', tag: 'NNX', country: 'Kenya', status: 'suspended', description: 'Suspended pending review of a fair-play report.', created_at: '2026-09-01T09:00:00.000Z' }),
  );

  const M = (id: string, team_id: string, player_id: string, role: TeamMembership['role'], status: TeamMembership['status'], joined_at: string) =>
    ({ id, team_id, player_id, role, status, joined_at });
  db.team_memberships.push(
    M('mb1', 'tm1', 'p1', 'captain', 'active', '2026-08-02T09:00:00.000Z'),
    M('mb2', 'tm1', 'p2', 'member', 'active', '2026-08-03T09:00:00.000Z'),
    M('mb3', 'tm1', 'p3', 'member', 'benched', '2026-08-10T09:00:00.000Z'),
    M('mb4', 'tm2', 'p4', 'captain', 'active', '2026-08-12T09:00:00.000Z'),
    M('mb5', 'tm2', 'p5', 'member', 'active', '2026-08-14T09:00:00.000Z'),
    M('mb6', 'tm2', 'p6', 'coach', 'active', '2026-08-15T09:00:00.000Z'),
    M('mb7', 'tm3', 'p7', 'captain', 'active', '2026-09-01T09:00:00.000Z'),
    M('mb8', 'tm3', 'p8', 'member', 'active', '2026-09-02T09:00:00.000Z'),
    M('mb9', 'tm4', 'p9', 'captain', 'active', '2026-09-10T09:00:00.000Z'),
  );

  db.tournaments.push(
    withDefaults('tournaments', { id: 't1', name: 'Nightfall Championship', game: 'Call of Duty', format: 'Double Elimination', status: 'ongoing', start_date: '2026-10-24T16:00:00.000Z', prize_pool: 5000, description: 'The flagship event. Top squads battle for the Nightfall crown.', max_participants: 32, escalation_level: 'medium', escalation_notes: 'Score dispute in round 1 under review.', created_at: '2026-09-20T09:00:00.000Z' }),
    withDefaults('tournaments', { id: 't2', name: 'Apex Open Cup', game: 'Apex Legends', format: 'Round Robin', status: 'upcoming', start_date: '2026-11-08T14:00:00.000Z', prize_pool: 2500, description: 'Open qualifiers for all regions. Register your squad before slots fill.', max_participants: 24, created_at: '2026-10-01T09:00:00.000Z' }),
    withDefaults('tournaments', { id: 't3', name: 'Valorant Showdown', game: 'Valorant', format: 'Swiss', status: 'upcoming', start_date: '2026-11-21T15:30:00.000Z', prize_pool: 3000, description: 'Multi-round points race across five maps.', max_participants: 20, created_at: '2026-10-05T09:00:00.000Z' }),
    withDefaults('tournaments', { id: 't4', name: 'CS2 Weekend Cup', game: 'Counter-Strike 2', format: 'Single Elimination', status: 'completed', start_date: '2026-10-05T12:00:00.000Z', prize_pool: 1000, description: 'One-day knockout cup. Congrats to the winners!', max_participants: 16, created_at: '2026-09-10T09:00:00.000Z' }),
  );

  const R = (id: string, tournament_id: string, team_id: string, status: TournamentRegistration['status'], notes: string, registered_at: string, reviewed_at: string | null) =>
    ({ id, tournament_id, team_id, status, notes, registered_at, reviewed_at, reviewed_by: reviewed_at ? 'Organizer' : '' });
  db.tournament_registrations.push(
    R('r1', 't1', 'tm1', 'approved', '', '2026-10-10T09:00:00.000Z', '2026-10-11T09:00:00.000Z'),
    R('r2', 't1', 'tm2', 'approved', '', '2026-10-10T10:00:00.000Z', '2026-10-11T09:30:00.000Z'),
    R('r3', 't2', 'tm2', 'approved', 'Full roster confirmed.', '2026-10-28T11:00:00.000Z', '2026-10-29T08:00:00.000Z'),
    R('r4', 't2', 'tm1', 'pending', '', '2026-11-01T12:00:00.000Z', null),
    R('r5', 't2', 'tm3', 'pending', 'Requesting late entry.', '2026-11-02T15:00:00.000Z', null),
    R('r6', 't3', 'tm4', 'rejected', 'Team is suspended.', '2026-10-30T09:00:00.000Z', '2026-10-31T09:00:00.000Z'),
    R('r7', 't4', 'tm3', 'approved', '', '2026-09-25T09:00:00.000Z', '2026-09-26T09:00:00.000Z'),
  );

  const MT = (id: string, tournament_id: string, round: number, player1: string, player2: string, score1: number | null, score2: number | null, winner: string | null, status: Match['status'], scheduled_at: string) =>
    ({ id, tournament_id, round, player1, player2, score1, score2, winner, status, scheduled_at, created_at: '2026-10-20T09:00:00.000Z' });
  db.matches.push(
    MT('m1', 't1', 1, 'Vortex Esports', 'Lagos Legends', 13, 9, 'Vortex Esports', 'completed', '2026-10-24T16:00:00.000Z'),
    MT('m2', 't1', 2, 'Vortex Esports', 'Accra Alpha', 5, 4, null, 'ongoing', '2026-10-29T15:00:00.000Z'),
    MT('m3', 't1', 2, 'Lagos Legends', 'TBD', null, null, null, 'scheduled', '2026-10-30T15:00:00.000Z'),
    MT('m4', 't2', 1, 'Lagos Legends', 'TBD', null, null, null, 'scheduled', '2026-11-08T14:00:00.000Z'),
    MT('m5', 't4', 1, 'Accra Alpha', 'Vortex Esports', 3, 1, 'Accra Alpha', 'completed', '2026-10-05T12:00:00.000Z'),
  );

  db.announcements.push(
    { id: 'a1', title: 'Nightfall Championship: Round 2 starts today', body: 'All round 2 matches begin at 3:00 PM WAT. Be in the lobby 15 minutes early.', priority: 'info', is_active: true, created_at: '2026-10-29T08:00:00.000Z' },
    { id: 'a2', title: 'Scheduled maintenance tonight', body: 'The platform will be unavailable from 11:00 PM to 12:00 AM while we deploy updates.', priority: 'warning', is_active: true, created_at: '2026-10-28T18:30:00.000Z' },
    { id: 'a3', title: 'Fair play reminder', body: 'Any player found using unauthorized tools will be disqualified and banned.', priority: 'critical', is_active: true, created_at: '2026-10-26T12:00:00.000Z' },
    { id: 'a4', title: 'CS2 Weekend Cup results are in', body: 'Congratulations to all participants. Final standings are now available.', priority: 'info', is_active: false, created_at: '2026-10-06T10:00:00.000Z' },
  );

  db.disputes.push(
    withDefaults('disputes', { id: 'd1', case_number: 'DSP-2026-001', title: 'Disputed score in Nightfall Round 1', description: 'Lagos Legends claim the final round was recorded incorrectly and request a review of the match log.', status: 'reviewing', priority: 'high', related_tournament_id: 't1', filed_by: 'Lagos Legends', assigned_to: 'Admin Team', created_at: '2026-10-25T09:00:00.000Z', updated_at: '2026-10-26T09:00:00.000Z' }),
    withDefaults('disputes', { id: 'd2', case_number: 'DSP-2026-002', title: 'Suspected account sharing', description: 'Report that one account was used by two different people during qualifiers.', status: 'escalated', priority: 'critical', filed_by: 'Accra Alpha', assigned_to: 'Admin Team', created_at: '2026-10-27T14:00:00.000Z', updated_at: '2026-10-28T10:00:00.000Z' }),
    withDefaults('disputes', { id: 'd3', case_number: 'DSP-2026-003', title: 'Wrong score entered for CS2 final', description: 'Final score was entered as 1 to 3 instead of 3 to 1.', status: 'closed', priority: 'medium', related_tournament_id: 't4', filed_by: 'Vortex Esports', assigned_to: 'Admin Team', resolution: 'Score corrected after reviewing match footage.', created_at: '2026-10-06T08:00:00.000Z', updated_at: '2026-10-07T08:00:00.000Z' }),
    withDefaults('disputes', { id: 'd4', case_number: 'DSP-2026-004', title: 'Late lobby start for Valorant qualifier', description: 'Players report the lobby opened 20 minutes late, affecting seeding.', status: 'open', priority: 'low', related_tournament_id: 't3', filed_by: 'Lagos Legends', created_at: '2026-11-02T16:00:00.000Z', updated_at: '2026-11-02T16:00:00.000Z' }),
  );

  db.organizers.push(
    { id: 'o1', first_name: 'Marcus', last_name: 'Reed', email: 'marcus.reed@agl.gg', password: '', role: 'senior_organizer', is_active: true, created_at: '2026-09-01T09:00:00.000Z' },
    { id: 'o2', first_name: 'Amara', last_name: 'Okafor', email: 'amara.okafor@agl.gg', password: '', role: 'organizer', is_active: true, created_at: '2026-09-15T09:00:00.000Z' },
    { id: 'o3', first_name: 'Tunde', last_name: 'Bello', email: 'tunde.bello@agl.gg', password: '', role: 'organizer', is_active: false, created_at: '2026-10-02T09:00:00.000Z' },
  );

  db.audit_log.push(
    { id: 'au1', action: 'ESCALATE_DISPUTE', entity_type: 'dispute', entity_id: 'DSP-2026-002', description: 'Dispute escalated (priority critical).', actor: 'Admin', metadata: {}, created_at: '2026-10-28T10:00:00.000Z' },
    { id: 'au2', action: 'SUSPEND_PLAYER', entity_type: 'player', entity_id: 'Ghost', description: 'Player suspended: Cheating violation flagged by anti-cheat system', actor: 'Admin', metadata: {}, created_at: '2026-10-27T10:00:00.000Z' },
    { id: 'au3', action: 'CORRECT_RESULT', entity_type: 'match', entity_id: 'm5', description: 'Result corrected: Accra Alpha 3 vs 1 Vortex Esports. Score entry error, corrected per DSP-2026-003', actor: 'Admin', metadata: {}, created_at: '2026-10-07T08:00:00.000Z' },
    { id: 'au4', action: 'ADD_ORGANIZER', entity_type: 'organizer', entity_id: 'amara.okafor@agl.gg', description: 'Organizer Amara Okafor added.', actor: 'Admin', metadata: {}, created_at: '2026-09-15T09:00:00.000Z' },
  );
}

if (SEED_SAMPLE_DATA) seed();
