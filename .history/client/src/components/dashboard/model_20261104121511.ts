/* =====================================================================
   TYPES
   ===================================================================== */
export type PlayerStatus = "online" | "away" | "offline";
export type TournamentStatus = "upcoming" | "ongoing" | "completed";
export type EscalationLevel = "none" | "low" | "medium" | "high";
export type MatchStatus = "scheduled" | "ongoing" | "completed";
export type AnnouncementPriority = "info" | "warning" | "critical";
export type TeamStatus = "active" | "suspended" | "disbanded";
export type MemberRole = "captain" | "member" | "coach";
export type MemberStatus = "active" | "benched" | "removed";
export type RegistrationStatus = "pending" | "approved" | "rejected";
export type DisputeStatus = "open" | "reviewing" | "escalated" | "closed";
export type DisputePriority = "low" | "medium" | "high" | "critical";

export type Player = {
    id: string;
    username: string;
    status: PlayerStatus;
    kills: number;
    deaths: number;
    wins: number;
    losses: number;
    matchesPlayed: number;
    rankTier: string;
    isSuspended: boolean;
    suspensionReason: string;
    suspendedAt: string | null;
};

export type Tournament = {
    id: string;
    name: string;
    game: string;
    format: string;
    status: TournamentStatus;
    startDate: string;
    prizePool: number;
    description: string;
    maxParticipants: number;
    escalationLevel: EscalationLevel;
    escalationNotes: string;
};

export type Match = {
    id: string;
    tournamentId: string;
    round: number;
    player1: string; // team name
    player2: string; // team name
    score1: number | null;
    score2: number | null;
    winner: string | null;
    status: MatchStatus;
    scheduledAt: string;
};

export type Announcement = {
    id: string;
    title: string;
    body: string;
    priority: AnnouncementPriority;
    isActive: boolean;
    createdAt: string;
};

export type Team = {
    id: string;
    name: string;
    tag: string;
    country: string;
    status: TeamStatus;
    description: string;
};

export type TeamMembership = {
    id: string;
    teamId: string;
    playerId: string;
    role: MemberRole;
    status: MemberStatus;
    joinedAt: string;
};

export type Registration = {
    id: string;
    tournamentId: string;
    teamId: string;
    status: RegistrationStatus;
    notes: string;
    registeredAt: string;
    reviewedAt: string | null;
    reviewedBy: string;
};

export type Dispute = {
    id: string;
    caseNumber: string;
    title: string;
    description: string;
    status: DisputeStatus;
    priority: DisputePriority;
    relatedTournamentId: string | null;
    filedBy: string;
    assignedTo: string;
    resolution: string;
    createdAt: string;
    updatedAt: string;
};

export type AuditEntry = {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    description: string;
    actor: string;
    createdAt: string;
};

export type Organizer = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
};

/* Drafts: what a form sends in. The store fills in ids and defaults. */
export type TournamentDraft = Pick<
    Tournament,
    "name" | "game" | "format" | "status" | "startDate" | "prizePool" | "description" | "maxParticipants"
>;
export type MatchDraft = Pick<
    Match,
    "tournamentId" | "round" | "player1" | "player2" | "scheduledAt"
>;
export type AnnouncementDraft = Pick<Announcement, "title" | "body" | "priority">;
export type TeamDraft = Pick<Team, "name" | "tag" | "country" | "description">;
export type OrganizerDraft = Pick<
    Organizer,
    "firstName" | "lastName" | "email" | "role"
>;
export type AuditDraft = {
    action: string;
    entityType: string;
    entityId: string;
    description: string;
    actor?: string;
};

/* =====================================================================
   SMALL HELPERS (used by screens)
   ===================================================================== */
export const kdOf = (kills: number, deaths: number) =>
    deaths === 0 ? kills : kills / deaths;

export const RANKS = ["Unranked", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"];
export const GAMES = ["Call of Duty: Mobile", "Free Fire", "PUBG Mobile", "eFootball"];
export const FORMATS = ["Single Elimination", "Double Elimination", "Round Robin", "Swiss"];