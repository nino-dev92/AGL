import { useState } from "react";
import {
    LuFlag,
    LuPencil,
    LuPlus,
    LuSave,
    LuSwords,
    LuTrophy,
} from "react-icons/lu";
import { useDashboard } from "../store";
import type { Match, MatchStatus } from "../model";
import {
    EmptyState,
    MatchStatusBadge,
    Modal,
    btnGhost,
    btnGold,
    btnPrimary,
    card,
    cardHover,
    input,
    label,
} from "../ui";

export default function ResultsPanel() {
    const { tournaments, matches, teams, addMatch, updateMatch } = useDashboard();
    const [selected, setSelected] = useState(tournaments[0]?.id ?? "");
    const [showAdd, setShowAdd] = useState(false);

    // If the selected tournament was deleted, fall back to the first one
    const selectedId = tournaments.some((t) => t.id === selected)
        ? selected
        : (tournaments[0]?.id ?? "");
    const tournament = tournaments.find((t) => t.id === selectedId);
    const tournamentMatches = matches
        .filter((m) => m.tournamentId === selectedId)
        .sort((a, b) => a.round - b.round);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    {tournaments.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setSelected(t.id)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${selectedId === t.id
                                    ? "bg-agl-red text-agl-white"
                                    : "border border-white/15 text-agl-gray hover:text-agl-white"
                                }`}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
                <button className={btnGold} onClick={() => setShowAdd(true)} disabled={!selectedId}>
                    <LuPlus size={18} /> Add Match
                </button>
            </div>

            {!tournament ? (
                <div className={card}>
                    <EmptyState
                        icon={LuSwords}
                        title="No tournaments available"
                        description="Create a tournament first to manage matches."
                    />
                </div>
            ) : tournamentMatches.length === 0 ? (
                <div className={card}>
                    <EmptyState
                        icon={LuFlag}
                        title="No matches scheduled"
                        description="Add a match to start recording results."
                    />
                </div>
            ) : (
                <div className="space-y-3">
                    {tournamentMatches.map((m) => (
                        <MatchResultRow
                            key={m.id}
                            match={m}
                            onSave={(s1, s2, status) => updateMatch(m.id, s1, s2, status)}
                        />
                    ))}
                </div>
            )}

            {showAdd && (
                <AddMatchModal
                    teamNames={teams.map((t) => t.name)}
                    onClose={() => setShowAdd(false)}
                    onSave={(draft) => {
                        addMatch({ ...draft, tournamentId: selectedId });
                        setShowAdd(false);
                    }}
                />
            )}
        </div>
    );
}

/* ---------- One match row ---------- */
function MatchResultRow({
    match,
    onSave,
}: {
    match: Match;
    onSave: (score1: number | null, score2: number | null, status: MatchStatus) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [s1, setS1] = useState(match.score1?.toString() ?? "");
    const [s2, setS2] = useState(match.score2?.toString() ?? "");
    const [status, setStatus] = useState<MatchStatus>(match.status);

    const save = () => {
        onSave(s1 === "" ? null : Number(s1), s2 === "" ? null : Number(s2), status);
        setEditing(false);
    };

    return (
        <div className={`${card} ${cardHover} p-4`}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-3">
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-bold text-agl-yellow">
                        R{match.round}
                    </span>
                    <div className="flex flex-1 items-center justify-between gap-2">
                        <TeamSlot name={match.player1} score={match.score1} winner={match.winner === match.player1} />
                        <span className="text-xs font-bold text-agl-gray-dark">VS</span>
                        <TeamSlot
                            name={match.player2}
                            score={match.score2}
                            winner={match.winner === match.player2}
                            alignRight
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="hidden sm:inline">
                        <MatchStatusBadge status={match.status} />
                    </span>
                    <button
                        aria-label="Edit result"
                        onClick={() => setEditing(!editing)}
                        className="rounded-lg p-1.5 text-agl-gray transition-colors hover:bg-white/5 hover:text-agl-yellow"
                    >
                        <LuPencil size={15} />
                    </button>
                </div>
            </div>

            {editing && (
                <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-white/15 pt-4">
                    <div>
                        <label className={label}>{match.player1} Score</label>
                        <input
                            type="number"
                            min="0"
                            className={`${input} w-28`}
                            value={s1}
                            onChange={(e) => setS1(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={label}>{match.player2} Score</label>
                        <input
                            type="number"
                            min="0"
                            className={`${input} w-28`}
                            value={s2}
                            onChange={(e) => setS2(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={label}>Status</label>
                        <select
                            className={input}
                            value={status}
                            onChange={(e) => setStatus(e.target.value as MatchStatus)}
                        >
                            <option value="scheduled">Scheduled</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button className={btnGhost} onClick={() => setEditing(false)}>
                            Cancel
                        </button>
                        <button className={btnPrimary} onClick={save}>
                            <LuSave size={16} /> Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function TeamSlot({
    name,
    score,
    winner,
    alignRight,
}: {
    name: string;
    score: number | null;
    winner: boolean;
    alignRight?: boolean;
}) {
    return (
        <div className={`flex items-center gap-2 ${alignRight ? "flex-row-reverse text-right" : ""}`}>
            <span className={`text-sm font-semibold ${winner ? "text-agl-yellow" : "text-agl-white"}`}>
                {name}
            </span>
            {score !== null && (
                <span className={`text-xl font-black ${winner ? "text-agl-yellow" : "text-agl-gray"}`}>
                    {score}
                </span>
            )}
            {winner && <LuTrophy size={14} className="text-agl-yellow" />}
        </div>
    );
}

/* ---------- Add match modal ---------- */
function AddMatchModal({
    teamNames,
    onClose,
    onSave,
}: {
    teamNames: string[];
    onClose: () => void;
    onSave: (draft: { round: number; player1: string; player2: string; scheduledAt: string }) => void;
}) {
    const options = [...teamNames, "TBD"];
    const [form, setForm] = useState({
        player1: teamNames[0] ?? "TBD",
        player2: "TBD",
        round: "1",
        scheduledAt: "",
    });

    const sameTeam = form.player1 === form.player2 && form.player1 !== "TBD";

    const submit = () => {
        if (sameTeam) return;
        onSave({
            player1: form.player1,
            player2: form.player2,
            round: Number(form.round) || 1,
            scheduledAt: form.scheduledAt
                ? new Date(form.scheduledAt).toISOString()
                : new Date().toISOString(),
        });
    };

    return (
        <Modal
            onClose={onClose}
            title="Schedule Match"
            subtitle="Add a new match to the bracket"
            footer={
                <>
                    <button className={btnGhost} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={btnGold} onClick={submit} disabled={sameTeam}>
                        <LuPlus size={16} /> Add Match
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className={label}>Team 1</label>
                        <select
                            className={input}
                            value={form.player1}
                            onChange={(e) => setForm({ ...form, player1: e.target.value })}
                        >
                            {options.map((o) => (
                                <option key={o}>{o}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={label}>Team 2</label>
                        <select
                            className={input}
                            value={form.player2}
                            onChange={(e) => setForm({ ...form, player2: e.target.value })}
                        >
                            {options.map((o) => (
                                <option key={o}>{o}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {sameTeam && (
                    <p className="text-xs text-agl-red">A team can't play against itself.</p>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className={label}>Round</label>
                        <input
                            type="number"
                            min="1"
                            className={input}
                            value={form.round}
                            onChange={(e) => setForm({ ...form, round: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={label}>Scheduled At</label>
                        <input
                            type="datetime-local"
                            className={input}
                            value={form.scheduledAt}
                            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}