import { useState } from "react";
import { LuFlag, LuPencil, LuSave, LuTriangleAlert, LuTrophy } from "react-icons/lu";
import { useDashboard } from "../store";
import type { Match, MatchStatus } from "../model";
import {
    EmptyState,
    MatchStatusBadge,
    Modal,
    btnGhost,
    btnGold,
    btnSmall,
    card,
    cardHover,
    input,
    label,
} from "../ui";

export default function ResultsAdminPanel() {
    const { tournaments, matches, correctMatch } = useDashboard();
    const [tournamentId, setTournamentId] = useState("all");
    const [correcting, setCorrecting] = useState<Match | null>(null);

    const shown = matches
        .filter((m) => tournamentId === "all" || m.tournamentId === tournamentId)
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight text-agl-white">
                    Result Corrections
                </h3>
                <select
                    className={`${input} sm:w-60`}
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
            </div>

            {shown.length === 0 ? (
                <div className={card}>
                    <EmptyState icon={LuFlag} title="No matches" description="There are no matches to review for this filter." />
                </div>
            ) : (
                <div className="space-y-3">
                    {shown.map((m) => {
                        const tournament = tournaments.find((t) => t.id === m.tournamentId);
                        return (
                            <div key={m.id} className={`${card} ${cardHover} p-4`}>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="mb-2 text-xs font-semibold text-agl-gray">
                                            {tournament?.name ?? "Unknown tournament"} · Round {m.round}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Side name={m.player1} score={m.score1} winner={m.winner === m.player1} />
                                            <span className="text-xs font-bold text-agl-gray-dark">VS</span>
                                            <Side name={m.player2} score={m.score2} winner={m.winner === m.player2} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MatchStatusBadge status={m.status} />
                                        <button className={`${btnGhost} ${btnSmall}`} onClick={() => setCorrecting(m)}>
                                            <LuPencil size={14} /> Correct
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {correcting && (
                <CorrectModal
                    match={correcting}
                    onClose={() => setCorrecting(null)}
                    onSave={(s1, s2, status, note) => {
                        correctMatch(correcting.id, s1, s2, status, note);
                        setCorrecting(null);
                    }}
                />
            )}
        </div>
    );
}

function Side({ name, score, winner }: { name: string; score: number | null; winner: boolean }) {
    return (
        <span className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${winner ? "text-agl-yellow" : "text-agl-white"}`}>
                {name}
            </span>
            {score !== null && (
                <span className={`text-xl font-black ${winner ? "text-agl-yellow" : "text-agl-gray"}`}>
                    {score}
                </span>
            )}
            {winner && <LuTrophy size={14} className="text-agl-yellow" />}
        </span>
    );
}

function CorrectModal({
    match,
    onClose,
    onSave,
}: {
    match: Match;
    onClose: () => void;
    onSave: (s1: number | null, s2: number | null, status: MatchStatus, note: string) => void;
}) {
    const [s1, setS1] = useState(match.score1?.toString() ?? "");
    const [s2, setS2] = useState(match.score2?.toString() ?? "");
    const [status, setStatus] = useState<MatchStatus>(match.status);
    const [note, setNote] = useState("");

    return (
        <Modal
            onClose={onClose}
            title="Correct Result"
            subtitle={`${match.player1} vs ${match.player2}`}
            footer={
                <>
                    <button className={btnGhost} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={btnGold}
                        disabled={!note.trim()}
                        onClick={() =>
                            onSave(s1 === "" ? null : Number(s1), s2 === "" ? null : Number(s2), status, note.trim())
                        }
                    >
                        <LuSave size={16} /> Save Correction
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="flex gap-3 rounded-lg border border-agl-yellow/40 bg-agl-yellow/10 p-3 text-sm text-agl-yellow">
                    <LuTriangleAlert size={18} className="mt-0.5 shrink-0" />
                    <p>Corrections change the official result and are recorded in the audit log.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={label}>{match.player1}</label>
                        <input type="number" min="0" className={input} value={s1} onChange={(e) => setS1(e.target.value)} />
                    </div>
                    <div>
                        <label className={label}>{match.player2}</label>
                        <input type="number" min="0" className={input} value={s2} onChange={(e) => setS2(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className={label}>Status</label>
                    <select className={input} value={status} onChange={(e) => setStatus(e.target.value as MatchStatus)}>
                        <option value="scheduled">Scheduled</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div>
                    <label className={label}>Audit note (required)</label>
                    <textarea
                        className={`${input} min-h-[80px]`}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Why is this result being corrected?"
                    />
                </div>
            </div>
        </Modal>
    );
}