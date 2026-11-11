import type {
    Announcement,
    AuditEntry,
    Dispute,
    Match,
    Organizer,
    Player,
    Registration,
    Team,
    TeamMembership,
    Tournament,
} from "./model";

/* =====================================================================
   SAMPLE DATA  (delete this file when the real API is connected)
   ===================================================================== */
export const samplePlayers: Player[] = [
    { id: "p1", username: "Zayn", status: "online", kills: 1840, deaths: 720, wins: 58, losses: 21, matchesPlayed: 79, rankTier: "Master", isSuspended: false, suspensionReason: "", suspendedAt: null },
    { id: "p2", username: "Blaze", status: "online", kills: 1520, deaths: 810, wins: 47, losses: 30, matchesPlayed: 77, rankTier: "Diamond", isSuspended: false, suspensionReason: "", suspendedAt: null },
    { id: "p3", username: "Phantom", status: "away", kills: 1210, deaths: 905, wins: 39, losses: 34, matchesPlayed: 73, rankTier: "Platinum", isSuspended: false, suspensionReason: "", suspendedAt: null },
    { id: "p4", username: "Nexus", status: "online", kills: 980, deaths: 640, wins: 33, losses: 19, matchesPlayed: 52, rankTier: "Diamond", isSuspended: false, suspensionReason: "", suspendedAt: null },
    { id: "p5", username: "Viper", status: "offline", kills: 760, deaths: 830, wins: 22, losses: 31, matchesPlayed: 53, rankTier: "Gold", isSuspended: false, suspensionReason: "", suspendedAt: null },
    { id: "p6", username: "Rogue", status: "offline", kills: 640, deaths: 700, wins: 18, losses: 24, matchesPlayed: 42, rankTier: "Gold", isSuspended: false, suspensionReason: "", suspendedAt: null },
    { id: "p7", username: "Kito", status: "away", kills: 530, deaths: 410, wins: 20, losses: 12, matchesPlayed: 32, rankTier: "Silver", isSuspended: false, suspensionReason: "", suspendedAt: null },
    { id: "p8", username: "Daze", status: "online", kills: 310, deaths: 450, wins: 9, losses: 17, matchesPlayed: 26, rankTier: "Bronze", isSuspended: false, suspensionReason: "", suspendedAt: null },
    { id: "p9", username: "Ghost", status: "offline", kills: 120, deaths: 210, wins: 4, losses: 11, matchesPlayed: 15, rankTier: "Bronze", isSuspended: true, suspensionReason: "Cheating violation flagged by anti-cheat system", suspendedAt: "2026-10-27T10:00:00.000Z" },
    { id: "p10", username: "NewBlood", status: "offline", kills: 0, deaths: 0, wins: 0, losses: 0, matchesPlayed: 0, rankTier: "Unranked", isSuspended: false, suspensionReason: "", suspendedAt: null },
];

export const sampleTeams: Team[] = [
    { id: "tm1", name: "Vortex Esports", tag: "VTX", country: "Nigeria", status: "active", description: "Lagos-based competitive squad with three seasons of CODM experience." },
    { id: "tm2", name: "Lagos Legends", tag: "LGL", country: "Nigeria", status: "active", description: "Open roster team focused on Free Fire and PUBG Mobile." },
    { id: "tm3", name: "Accra Alpha", tag: "ACA", country: "Ghana", status: "active", description: "Rising Ghanaian team, strong in eFootball." },
    { id: "tm4", name: "Nairobi Nexus", tag: "NNX", country: "Kenya", status: "suspended", description: "Suspended pending review of a fair-play report." },
];

export const sampleMemberships: TeamMembership[] = [
    { id: "mb1", teamId: "tm1", playerId: "p1", role: "captain", status: "active", joinedAt: "2026-08-02T09:00:00.000Z" },
    { id: "mb2", teamId: "tm1", playerId: "p2", role: "member", status: "active", joinedAt: "2026-08-03T09:00:00.000Z" },
    { id: "mb3", teamId: "tm1", playerId: "p3", role: "member", status: "benched", joinedAt: "2026-08-10T09:00:00.000Z" },
    { id: "mb4", teamId: "tm2", playerId: "p4", role: "captain", status: "active", joinedAt: "2026-08-12T09:00:00.000Z" },
    { id: "mb5", teamId: "tm2", playerId: "p5", role: "member", status: "active", joinedAt: "2026-08-14T09:00:00.000Z" },
    { id: "mb6", teamId: "tm2", playerId: "p6", role: "coach", status: "active", joinedAt: "2026-08-15T09:00:00.000Z" },
    { id: "mb7", teamId: "tm3", playerId: "p7", role: "captain", status: "active", joinedAt: "2026-09-01T09:00:00.000Z" },
    { id: "mb8", teamId: "tm3", playerId: "p8", role: "member", status: "active", joinedAt: "2026-09-02T09:00:00.000Z" },
    { id: "mb9", teamId: "tm4", playerId: "p9", role: "captain", status: "active", joinedAt: "2026-09-10T09:00:00.000Z" },
];

export const sampleTournaments: Tournament[] = [
    { id: "t1", name: "Nightfall Championship", game: "Call of Duty: Mobile", format: "Double Elimination", status: "ongoing", startDate: "2026-10-24T16:00:00.000Z", prizePool: 5000, description: "The flagship CODM event. Top squads battle for the Nightfall crown.", maxParticipants: 32, escalationLevel: "medium", escalationNotes: "Score dispute in round 1 under review." },
    { id: "t2", name: "Free Fire Open Cup", game: "Free Fire", format: "Round Robin", status: "upcoming", startDate: "2026-11-08T14:00:00.000Z", prizePool: 2500, description: "Open qualifiers for all regions. Register your squad before slots fill.", maxParticipants: 24, escalationLevel: "none", escalationNotes: "" },
    { id: "t3", name: "PUBG Mobile Showdown", game: "PUBG Mobile", format: "Swiss", status: "upcoming", startDate: "2026-11-21T15:30:00.000Z", prizePool: 3000, description: "Multi-round points race across five maps.", maxParticipants: 20, escalationLevel: "none", escalationNotes: "" },
    { id: "t4", name: "eFootball Weekend Cup", game: "eFootball", format: "Single Elimination", status: "completed", startDate: "2026-10-05T12:00:00.000Z", prizePool: 1000, description: "One-day knockout cup. Congrats to the winners!", maxParticipants: 16, escalationLevel: "none", escalationNotes: "" },
];

export const sampleRegistrations: Registration[] = [
    { id: "r1", tournamentId: "t1", teamId: "tm1", status: "approved", notes: "", registeredAt: "2026-10-10T09:00:00.000Z", reviewedAt: "2026-10-11T09:00:00.000Z", reviewedBy: "Organizer" },
    { id: "r2", tournamentId: "t1", teamId: "tm2", status: "approved", notes: "", registeredAt: "2026-10-10T10:00:00.000Z", reviewedAt: "2026-10-11T09:30:00.000Z", reviewedBy: "Organizer" },
    { id: "r3", tournamentId: "t2", teamId: "tm2", status: "approved", notes: "Full roster confirmed.", registeredAt: "2026-10-28T11:00:00.000Z", reviewedAt: "2026-10-29T08:00:00.000Z", reviewedBy: "Organizer" },
    { id: "r4", tournamentId: "t2", teamId: "tm1", status: "pending", notes: "", registeredAt: "2026-11-01T12:00:00.000Z", reviewedAt: null, reviewedBy: "" },
    { id: "r5", tournamentId: "t2", teamId: "tm3", status: "pending", notes: "Requesting late entry.", registeredAt: "2026-11-02T15:00:00.000Z", reviewedAt: null, reviewedBy: "" },
    { id: "r6", tournamentId: "t3", teamId: "tm4", status: "rejected", notes: "Team is suspended.", registeredAt: "2026-10-30T09:00:00.000Z", reviewedAt: "2026-10-31T09:00:00.000Z", reviewedBy: "Organizer" },
    { id: "r7", tournamentId: "t4", teamId: "tm3", status: "approved", notes: "", registeredAt: "2026-09-25T09:00:00.000Z", reviewedAt: "2026-09-26T09:00:00.000Z", reviewedBy: "Organizer" },
];

export const sampleMatches: Match[] = [
    { id: "m1", tournamentId: "t1", round: 1, player1: "Vortex Esports", player2: "Lagos Legends", score1: 13, score2: 9, winner: "Vortex Esports", status: "completed", scheduledAt: "2026-10-24T16:00:00.000Z" },
    { id: "m2", tournamentId: "t1", round: 2, player1: "Vortex Esports", player2: "Accra Alpha", score1: 5, score2: 4, winner: null, status: "ongoing", scheduledAt: "2026-10-29T15:00:00.000Z" },
    { id: "m3", tournamentId: "t1", round: 2, player1: "Lagos Legends", player2: "TBD", score1: null, score2: null, winner: null, status: "scheduled", scheduledAt: "2026-10-30T15:00:00.000Z" },
    { id: "m4", tournamentId: "t2", round: 1, player1: "Lagos Legends", player2: "TBD", score1: null, score2: null, winner: null, status: "scheduled", scheduledAt: "2026-11-08T14:00:00.000Z" },
    { id: "m5", tournamentId: "t4", round: 1, player1: "Accra Alpha", player2: "Vortex Esports", score1: 3, score2: 1, winner: "Accra Alpha", status: "completed", scheduledAt: "2026-10-05T12:00:00.000Z" },
];

export const sampleAnnouncements: Announcement[] = [
    { id: "a1", title: "Nightfall Championship: Round 2 starts today", body: "All round 2 matches begin at 3:00 PM WAT. Be in the lobby 15 minutes early.", priority: "info", isActive: true, createdAt: "2026-10-29T08:00:00.000Z" },
    { id: "a2", title: "Scheduled maintenance tonight", body: "The platform will be unavailable from 11:00 PM to 12:00 AM while we deploy updates.", priority: "warning", isActive: true, createdAt: "2026-10-28T18:30:00.000Z" },
    { id: "a3", title: "Fair play reminder", body: "Any player found using unauthorized tools will be disqualified and banned.", priority: "critical", isActive: true, createdAt: "2026-10-26T12:00:00.000Z" },
    { id: "a4", title: "eFootball Weekend Cup results are in", body: "Congratulations to all participants. Final standings are now available.", priority: "info", isActive: false, createdAt: "2026-10-06T10:00:00.000Z" },
];

export const sampleDisputes: Dispute[] = [
    { id: "d1", caseNumber: "DSP-2026-001", title: "Disputed score in Nightfall Round 1", description: "Lagos Legends claim the final round was recorded incorrectly and request a review of the match log.", status: "reviewing", priority: "high", relatedTournamentId: "t1", filedBy: "Lagos Legends", assignedTo: "Admin Team", resolution: "", createdAt: "2026-10-25T09:00:00.000Z", updatedAt: "2026-10-26T09:00:00.000Z" },
    { id: "d2", caseNumber: "DSP-2026-002", title: "Suspected account sharing", description: "Report that one account was used by two different people during qualifiers.", status: "escalated", priority: "critical", relatedTournamentId: null, filedBy: "Accra Alpha", assignedTo: "Admin Team", resolution: "", createdAt: "2026-10-27T14:00:00.000Z", updatedAt: "2026-10-28T10:00:00.000Z" },
    { id: "d3", caseNumber: "DSP-2026-003", title: "Wrong score entered for eFootball final", description: "Final score was entered as 1 to 3 instead of 3 to 1.", status: "closed", priority: "medium", relatedTournamentId: "t4", filedBy: "Vortex Esports", assignedTo: "Admin Team", resolution: "Score corrected after reviewing match footage.", createdAt: "2026-10-06T08:00:00.000Z", updatedAt: "2026-10-07T08:00:00.000Z" },
    { id: "d4", caseNumber: "DSP-2026-004", title: "Late lobby start for PUBG qualifier", description: "Players report the lobby opened 20 minutes late, affecting seeding.", status: "open", priority: "low", relatedTournamentId: "t3", filedBy: "Lagos Legends", assignedTo: "Unassigned", resolution: "", createdAt: "2026-11-02T16:00:00.000Z", updatedAt: "2026-11-02T16:00:00.000Z" },
];

export const sampleOrganizers: Organizer[] = [
    { id: "o1", firstName: "Marcus", lastName: "Reed", email: "marcus.reed@agl.gg", role: "senior_organizer", isActive: true, createdAt: "2026-09-01T09:00:00.000Z" },
    { id: "o2", firstName: "Amara", lastName: "Okafor", email: "amara.okafor@agl.gg", role: "organizer", isActive: true, createdAt: "2026-09-15T09:00:00.000Z" },
    { id: "o3", firstName: "Tunde", lastName: "Bello", email: "tunde.bello@agl.gg", role: "organizer", isActive: false, createdAt: "2026-10-02T09:00:00.000Z" },
];

export const sampleAudit: AuditEntry[] = [
    { id: "au1", action: "ESCALATE_DISPUTE", entityType: "dispute", entityId: "DSP-2026-002", description: "Dispute escalated (priority critical).", actor: "Admin", createdAt: "2026-10-28T10:00:00.000Z" },
    { id: "au2", action: "SUSPEND_PLAYER", entityType: "player", entityId: "Ghost", description: "Player suspended: Cheating violation flagged by anti-cheat system", actor: "Admin", createdAt: "2026-10-27T10:00:00.000Z" },
    { id: "au3", action: "CORRECT_RESULT", entityType: "match", entityId: "m5", description: "Result corrected: Accra Alpha 3 vs 1 Vortex Esports. Score entry error, corrected per DSP-2026-003", actor: "Admin", createdAt: "2026-10-07T08:00:00.000Z" },
    { id: "au4", action: "ADD_ORGANIZER", entityType: "organizer", entityId: "amara.okafor@agl.gg", description: "Organizer Amara Okafor added.", actor: "Admin", createdAt: "2026-09-15T09:00:00.000Z" },
];