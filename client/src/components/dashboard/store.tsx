import { createContext, useContext, useState, type ReactNode } from "react";
import type {
    Announcement,
    AnnouncementDraft,
    AuditDraft,
    AuditEntry,
    Dispute,
    DisputePriority,
    EscalationLevel,
    Match,
    MatchDraft,
    MatchStatus,
    MemberRole,
    MemberStatus,
    Organizer,
    OrganizerDraft,
    Player,
    Registration,
    Team,
    TeamDraft,
    TeamMembership,
    TeamStatus,
    Tournament,
    TournamentDraft,
} from "./model";
import {
    sampleAnnouncements,
    sampleAudit,
    sampleDisputes,
    sampleMatches,
    sampleMemberships,
    sampleOrganizers,
    samplePlayers,
    sampleRegistrations,
    sampleTeams,
    sampleTournaments,
} from "./sampleData";

// Screens import everything (types, helpers, hook) from this one file.
// eslint-disable-next-line react-refresh/only-export-components
export * from "./model";

const uid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

/** Work out a match winner from the scores (a tie means no winner). */
function scorePatch(
    match: Match,
    score1: number | null,
    score2: number | null,
    status: MatchStatus,
): Partial<Match> {
    let winner = match.winner;
    if (score1 !== null && score2 !== null) {
        winner = score1 > score2 ? match.player1 : score2 > score1 ? match.player2 : null;
    }
    return { score1, score2, status, winner };
}

/* =====================================================================
   STORE
   ===================================================================== */
export type DashboardStore = {
    /* data */
    players: Player[];
    tournaments: Tournament[];
    matches: Match[];
    announcements: Announcement[];
    teams: Team[];
    memberships: TeamMembership[];
    registrations: Registration[];
    disputes: Dispute[];
    organizers: Organizer[];
    auditLog: AuditEntry[];

    /* helpers */
    approvedCount: (tournamentId: string) => number;
    logAudit: (entry: AuditDraft) => void;

    /* tournaments */
    addTournament: (draft: TournamentDraft) => void;
    updateTournament: (id: string, patch: Partial<TournamentDraft>) => void;
    deleteTournament: (id: string) => void;
    setEscalation: (id: string, level: EscalationLevel, notes: string) => void;

    /* registrations */
    registerTeam: (tournamentId: string, teamId: string) => void;
    reviewRegistration: (id: string, status: "approved" | "rejected", reviewedBy?: string) => void;

    /* matches */
    addMatch: (draft: MatchDraft) => void;
    updateMatch: (id: string, score1: number | null, score2: number | null, status: MatchStatus) => void;
    correctMatch: (id: string, score1: number | null, score2: number | null, status: MatchStatus, note: string) => void;

    /* announcements */
    addAnnouncement: (draft: AnnouncementDraft) => void;
    toggleAnnouncement: (id: string) => void;
    deleteAnnouncement: (id: string) => void;

    /* teams and members */
    addTeam: (draft: TeamDraft) => void;
    setTeamStatus: (id: string, status: TeamStatus) => void;
    /** Returns an error message, or null on success. */
    addMember: (teamId: string, playerId: string, role: MemberRole) => string | null;
    removeMember: (id: string) => void;
    setMemberStatus: (id: string, status: MemberStatus) => void;

    /* players */
    updatePlayer: (id: string, patch: Partial<Player>) => void;
    suspendPlayer: (id: string, reason: string) => void;
    reinstatePlayer: (id: string) => void;

    /* disputes */
    assignDispute: (id: string, assignTo: string) => void;
    escalateDispute: (id: string, priority: DisputePriority) => void;
    closeDispute: (id: string, resolution: string) => void;

    /* organizers (passwords are never stored in this frontend-only version) */
    addOrganizer: (draft: OrganizerDraft) => string | null;
    updateOrganizer: (id: string, draft: OrganizerDraft) => string | null;
    toggleOrganizer: (id: string) => void;
    deleteOrganizer: (id: string) => void;
};

const DashboardContext = createContext<DashboardStore | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useDashboard(): DashboardStore {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error("useDashboard must be used inside <DashboardProvider>");
    return ctx;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [players, setPlayers] = useState(samplePlayers);
    const [tournaments, setTournaments] = useState(sampleTournaments);
    const [matches, setMatches] = useState(sampleMatches);
    const [announcements, setAnnouncements] = useState(sampleAnnouncements);
    const [teams, setTeams] = useState(sampleTeams);
    const [memberships, setMemberships] = useState(sampleMemberships);
    const [registrations, setRegistrations] = useState(sampleRegistrations);
    const [disputes, setDisputes] = useState(sampleDisputes);
    const [organizers, setOrganizers] = useState(sampleOrganizers);
    const [auditLog, setAuditLog] = useState(sampleAudit);

    /* ---- audit ---- */
    const logAudit: DashboardStore["logAudit"] = (e) =>
        setAuditLog((prev) => [
            {
                id: uid(),
                action: e.action,
                entityType: e.entityType,
                entityId: e.entityId,
                description: e.description,
                actor: e.actor ?? "Admin",
                createdAt: nowIso(),
            },
            ...prev,
        ]);

    const approvedCount = (tournamentId: string) =>
        registrations.filter((r) => r.tournamentId === tournamentId && r.status === "approved").length;

    /* ---- tournaments ---- */
    const addTournament: DashboardStore["addTournament"] = (draft) =>
        setTournaments((prev) => [
            ...prev,
            { ...draft, id: uid(), escalationLevel: "none", escalationNotes: "" },
        ]);

    const updateTournament: DashboardStore["updateTournament"] = (id, patch) =>
        setTournaments((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

    const deleteTournament: DashboardStore["deleteTournament"] = (id) => {
        setTournaments((prev) => prev.filter((t) => t.id !== id));
        setMatches((prev) => prev.filter((m) => m.tournamentId !== id));
        setRegistrations((prev) => prev.filter((r) => r.tournamentId !== id));
    };

    const setEscalation: DashboardStore["setEscalation"] = (id, level, notes) => {
        const t = tournaments.find((x) => x.id === id);
        setTournaments((prev) =>
            prev.map((x) => (x.id === id ? { ...x, escalationLevel: level, escalationNotes: notes } : x)),
        );
        logAudit({
            action: "ESCALATE_TOURNAMENT",
            entityType: "tournament",
            entityId: t?.name ?? id,
            description: `Escalation set to ${level}. ${notes}`,
        });
    };

    /* ---- registrations ---- */
    const registerTeam: DashboardStore["registerTeam"] = (tournamentId, teamId) =>
        setRegistrations((prev) => {
            if (prev.some((r) => r.tournamentId === tournamentId && r.teamId === teamId)) return prev;
            return [
                {
                    id: uid(),
                    tournamentId,
                    teamId,
                    status: "pending",
                    notes: "",
                    registeredAt: nowIso(),
                    reviewedAt: null,
                    reviewedBy: "",
                },
                ...prev,
            ];
        });

    const reviewRegistration: DashboardStore["reviewRegistration"] = (id, status, reviewedBy = "Organizer") =>
        setRegistrations((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status, reviewedAt: nowIso(), reviewedBy } : r)),
        );

    /* ---- matches ---- */
    const addMatch: DashboardStore["addMatch"] = (draft) =>
        setMatches((prev) => [
            ...prev,
            { ...draft, id: uid(), score1: null, score2: null, winner: null, status: "scheduled" },
        ]);

    const updateMatch: DashboardStore["updateMatch"] = (id, s1, s2, status) =>
        setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...scorePatch(m, s1, s2, status) } : m)));

    const correctMatch: DashboardStore["correctMatch"] = (id, s1, s2, status, note) => {
        const m = matches.find((x) => x.id === id);
        if (!m) return;
        updateMatch(id, s1, s2, status);
        logAudit({
            action: "CORRECT_RESULT",
            entityType: "match",
            entityId: id,
            description: `Result corrected: ${m.player1} ${s1 ?? "-"} vs ${s2 ?? "-"} ${m.player2}. ${note}`,
        });
    };

    /* ---- announcements ---- */
    const addAnnouncement: DashboardStore["addAnnouncement"] = (draft) =>
        setAnnouncements((prev) => [{ ...draft, id: uid(), isActive: true, createdAt: nowIso() }, ...prev]);

    const toggleAnnouncement: DashboardStore["toggleAnnouncement"] = (id) =>
        setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));

    const deleteAnnouncement: DashboardStore["deleteAnnouncement"] = (id) =>
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));

    /* ---- teams and members ---- */
    const addTeam: DashboardStore["addTeam"] = (draft) =>
        setTeams((prev) => [...prev, { ...draft, id: uid(), status: "active" }]);

    const setTeamStatus: DashboardStore["setTeamStatus"] = (id, status) => {
        const t = teams.find((x) => x.id === id);
        setTeams((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
        logAudit({
            action: `TEAM_${status.toUpperCase()}`,
            entityType: "team",
            entityId: t?.name ?? id,
            description: `Team status set to ${status}.`,
        });
    };

    const addMember: DashboardStore["addMember"] = (teamId, playerId, role) => {
        if (memberships.some((m) => m.teamId === teamId && m.playerId === playerId)) {
            return "Player is already on this team.";
        }
        setMemberships((prev) => [
            ...prev,
            { id: uid(), teamId, playerId, role, status: "active", joinedAt: nowIso() },
        ]);
        return null;
    };

    const removeMember: DashboardStore["removeMember"] = (id) =>
        setMemberships((prev) => prev.filter((m) => m.id !== id));

    const setMemberStatus: DashboardStore["setMemberStatus"] = (id, status) => {
        const m = memberships.find((x) => x.id === id);
        const p = players.find((x) => x.id === m?.playerId);
        setMemberships((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
        logAudit({
            action: "MEMBER_STATUS",
            entityType: "team_membership",
            entityId: id,
            description: `Member ${p?.username ?? "unknown"} set to ${status}.`,
        });
    };

    /* ---- players ---- */
    const updatePlayer: DashboardStore["updatePlayer"] = (id, patch) =>
        setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

    const suspendPlayer: DashboardStore["suspendPlayer"] = (id, reason) => {
        const p = players.find((x) => x.id === id);
        updatePlayer(id, { isSuspended: true, suspensionReason: reason, suspendedAt: nowIso() });
        logAudit({
            action: "SUSPEND_PLAYER",
            entityType: "player",
            entityId: p?.username ?? id,
            description: `Player suspended: ${reason || "no reason given"}`,
        });
    };

    const reinstatePlayer: DashboardStore["reinstatePlayer"] = (id) => {
        const p = players.find((x) => x.id === id);
        updatePlayer(id, { isSuspended: false, suspensionReason: "", suspendedAt: null });
        logAudit({
            action: "REINSTATE_PLAYER",
            entityType: "player",
            entityId: p?.username ?? id,
            description: "Player reinstated, suspension lifted.",
        });
    };

    /* ---- disputes ---- */
    const patchDispute = (id: string, patch: Partial<Dispute>) =>
        setDisputes((prev) =>
            prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: nowIso() } : d)),
        );

    const assignDispute: DashboardStore["assignDispute"] = (id, assignTo) => {
        const d = disputes.find((x) => x.id === id);
        if (!d) return;
        patchDispute(id, { assignedTo: assignTo, status: d.status === "open" ? "reviewing" : d.status });
        logAudit({
            action: "ASSIGN_DISPUTE",
            entityType: "dispute",
            entityId: d.caseNumber,
            description: `Dispute assigned to ${assignTo}.`,
        });
    };

    const escalateDispute: DashboardStore["escalateDispute"] = (id, priority) => {
        const d = disputes.find((x) => x.id === id);
        if (!d) return;
        patchDispute(id, { status: "escalated", priority });
        logAudit({
            action: "ESCALATE_DISPUTE",
            entityType: "dispute",
            entityId: d.caseNumber,
            description: `Dispute escalated (priority ${priority}).`,
        });
    };

    const closeDispute: DashboardStore["closeDispute"] = (id, resolution) => {
        const d = disputes.find((x) => x.id === id);
        if (!d) return;
        patchDispute(id, { status: "closed", resolution });
        logAudit({
            action: "CLOSE_DISPUTE",
            entityType: "dispute",
            entityId: d.caseNumber,
            description: `Dispute closed. Resolution: ${resolution}`,
        });
    };

    /* ---- organizers ---- */
    const emailTaken = (email: string, exceptId?: string) =>
        organizers.some((o) => o.email.toLowerCase() === email.toLowerCase() && o.id !== exceptId);

    const addOrganizer: DashboardStore["addOrganizer"] = (draft) => {
        if (emailTaken(draft.email)) return "An organizer with this email already exists.";
        setOrganizers((prev) => [{ ...draft, id: uid(), isActive: true, createdAt: nowIso() }, ...prev]);
        logAudit({
            action: "ADD_ORGANIZER",
            entityType: "organizer",
            entityId: draft.email,
            description: `Organizer ${draft.firstName} ${draft.lastName} added.`,
        });
        return null;
    };

    const updateOrganizer: DashboardStore["updateOrganizer"] = (id, draft) => {
        if (emailTaken(draft.email, id)) return "An organizer with this email already exists.";
        setOrganizers((prev) => prev.map((o) => (o.id === id ? { ...o, ...draft } : o)));
        logAudit({
            action: "UPDATE_ORGANIZER",
            entityType: "organizer",
            entityId: draft.email,
            description: `Organizer ${draft.firstName} ${draft.lastName} updated.`,
        });
        return null;
    };

    const toggleOrganizer: DashboardStore["toggleOrganizer"] = (id) => {
        const o = organizers.find((x) => x.id === id);
        if (!o) return;
        setOrganizers((prev) => prev.map((x) => (x.id === id ? { ...x, isActive: !x.isActive } : x)));
        logAudit({
            action: o.isActive ? "DEACTIVATE_ORGANIZER" : "ACTIVATE_ORGANIZER",
            entityType: "organizer",
            entityId: o.email,
            description: `Organizer ${o.firstName} ${o.lastName} ${o.isActive ? "deactivated" : "activated"}.`,
        });
    };

    const deleteOrganizer: DashboardStore["deleteOrganizer"] = (id) => {
        const o = organizers.find((x) => x.id === id);
        if (!o) return;
        setOrganizers((prev) => prev.filter((x) => x.id !== id));
        logAudit({
            action: "DELETE_ORGANIZER",
            entityType: "organizer",
            entityId: o.email,
            description: `Organizer ${o.firstName} ${o.lastName} removed.`,
        });
    };

    const value: DashboardStore = {
        players, tournaments, matches, announcements, teams, memberships,
        registrations, disputes, organizers, auditLog,
        approvedCount, logAudit,
        addTournament, updateTournament, deleteTournament, setEscalation,
        registerTeam, reviewRegistration,
        addMatch, updateMatch, correctMatch,
        addAnnouncement, toggleAnnouncement, deleteAnnouncement,
        addTeam, setTeamStatus, addMember, removeMember, setMemberStatus,
        updatePlayer, suspendPlayer, reinstatePlayer,
        assignDispute, escalateDispute, closeDispute,
        addOrganizer, updateOrganizer, toggleOrganizer, deleteOrganizer,
    };

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}