import { useState } from "react";
import { LuCheck, LuClipboardCheck, LuClock, LuX } from "react-icons/lu";
import { useDashboard } from "../store";
import type { RegistrationStatus } from "../model";
import {
    EmptyState,
    Pills,
    RegistrationStatusBadge,
    TeamStatusBadge,
    btnDanger,
    btnPrimary,
    btnSmall,
    card,
    cardHover,
    input,
} from "../ui";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function RegistrationsPanel() {
    const { registrations, tournaments, teams, reviewRegistration } = useDashboard();
    const [tournamentId, setTournamentId] = useState("all");
    const [status, setStatus] = useState<StatusFilter>("all");

    const inTournament = registrations.filter(
        (r) => tournamentId === "all" || r.tournamentId === tournamentId,
    );
    const pendingCount = inTournament.filter((r) => r.status === "pending").length;

    const shown = inTournament
        .filter((r) => status === "all" || r.status === (status as RegistrationStatus))
        .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight text-agl-white">
                    Team Registrations
                </h3>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                        className={`${input} sm:w-56`}
                        value={tournamentId}
                        onChange={(e) => setTournamentId(e.target.value)}
                    >
                        <option value="all">All tournaments</option>
                        {tournaments.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                    <Pills options={STATUS_FILTERS} value={status} onChange={setStatus} />
                </div>
            </div>

            {pendingCount > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-agl-yellow/40 bg-agl-yellow/10 px-4 py-3 text-sm font-semibold text-agl-yellow">
                    <LuClock size={16} />
                    {pendingCount} registration{pendingCount === 1 ? "" : "s"} awaiting review
                </div>
            )}

            {shown.length === 0 ? (
                <div className={card}>
                    <EmptyState
                        icon={LuClipboardCheck}
                        title="No registrations"
                        description="Team registrations will appear here when managers sign up for tournaments."
                    />
                </div>
            ) : (
                <div className="space-y-3">
                    {shown.map((r) => {
                        const team = teams.find((t) => t.id === r.teamId);
                        const tournament = tournaments.find((t) => t.id === r.tournamentId);
                        return (
                            <div key={r.id} className={`${card} ${cardHover} p-4`}>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                            <RegistrationStatusBadge status={r.status} />
                                            <span className="text-xs font-semibold text-agl-gray">
                                                {tournament?.name ?? "Unknown tournament"}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="text-lg font-black uppercase tracking-tight text-agl-white">
                                                {team?.name ?? "Unknown team"}
                                            </h4>
                                            {team && (
                                                <>
                                                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-bold text-agl-yellow">
                                                        {team.tag}
                                                    </span>
                                                    <TeamStatusBadge status={team.status} />
                                                </>
                                            )}
                                        </div>

                                        <p className="mt-1 text-xs text-agl-gray">
                                            Registered {fmt(r.registeredAt)}
                                            {r.reviewedAt && ` · Reviewed ${fmt(r.reviewedAt)} by ${r.reviewedBy}`}
                                        </p>
                                        {r.notes && <p className="mt-1 text-sm italic text-agl-gray">{r.notes}</p>}
                                    </div>

                                    {r.status === "pending" && (
                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                className={`${btnPrimary} ${btnSmall}`}
                                                onClick={() => reviewRegistration(r.id, "approved")}
                                            >
                                                <LuCheck size={14} /> Approve
                                            </button>
                                            <button
                                                className={`${btnDanger} ${btnSmall}`}
                                                onClick={() => reviewRegistration(r.id, "rejected")}
                                            >
                                                <LuX size={14} /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}