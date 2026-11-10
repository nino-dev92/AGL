import { useState } from "react";
import {
    LuCalendar,
    LuCircleDot,
    LuDollarSign,
    LuGamepad2,
    LuPencil,
    LuPlus,
    LuSave,
    LuTrophy,
    LuUsers,
} from "react-icons/lu";
import { useDashboard } from "../store";
import {
    FORMATS,
    GAMES,
    type Tournament,
    type TournamentDraft,
    type TournamentStatus,
} from "../model";
import {
    DeleteButton,
    EmptyState,
    MiniStat,
    Modal,
    StatCard,
    TournamentStatusBadge,
    btnGhost,
    btnPrimary,
    card,
    cardHover,
    input,
    label,
} from "../ui";

const money = (n: number) => `$${n.toLocaleString()}`;

/** ISO string -> value for <input type="datetime-local"> in local time */
const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function TournamentsPanel() {
    const { tournaments, approvedCount, addTournament, updateTournament, deleteTournament } =
        useDashboard();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Tournament | null>(null);

    const ongoing = tournaments.filter((t) => t.status === "ongoing").length;
    const totalPrize = tournaments.reduce((sum, t) => sum + t.prizePool, 0);

    const openCreate = () => {
        setEditing(null);
        setShowForm(true);
    };
    const openEdit = (t: Tournament) => {
        setEditing(t);
        setShowForm(true);
    };

    const save = (draft: TournamentDraft) => {
        if (editing) updateTournament(editing.id, draft);
        else addTournament(draft);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard icon={LuTrophy} label="Total Tournaments" value={String(tournaments.length)} />
                <StatCard
                    icon={LuCircleDot}
                    label="Ongoing Now"
                    value={String(ongoing)}
                    accent="text-agl-red"
                    iconClass="bg-agl-red/10 text-agl-red"
                />
                <StatCard
                    icon={LuDollarSign}
                    label="Combined Prize Pool"
                    value={money(totalPrize)}
                    accent="text-agl-yellow"
                    iconClass="bg-agl-yellow/10 text-agl-yellow"
                />
            </div>

            <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-black uppercase tracking-tight text-agl-white">
                    All Tournaments
                </h3>
                <button className={btnPrimary} onClick={openCreate}>
                    <LuPlus size={18} /> New Tournament
                </button>
            </div>

            {tournaments.length === 0 ? (
                <div className={card}>
                    <EmptyState
                        icon={LuTrophy}
                        title="No tournaments yet"
                        description="Create your first tournament to get started."
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {tournaments.map((t) => (
                        <div key={t.id} className={`${card} ${cardHover} p-5`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <TournamentStatusBadge status={t.status} />
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-agl-gray">
                                            <LuGamepad2 size={12} /> {t.game}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-black uppercase tracking-tight text-agl-white">
                                        {t.name}
                                    </h4>
                                    <p className="mt-1 line-clamp-2 text-sm text-agl-gray">{t.description}</p>
                                </div>

                                <div className="flex shrink-0 gap-1">
                                    <button
                                        aria-label="Edit tournament"
                                        onClick={() => openEdit(t)}
                                        className="rounded-lg p-2 text-agl-gray transition-colors hover:bg-white/5 hover:text-agl-yellow"
                                    >
                                        <LuPencil size={16} />
                                    </button>
                                    <DeleteButton onConfirm={() => deleteTournament(t.id)} />
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/15 pt-4 text-center">
                                <MiniStat
                                    icon={LuCalendar}
                                    label="Start"
                                    value={new Date(t.startDate).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                />
                                <MiniStat
                                    icon={LuUsers}
                                    label="Slots"
                                    value={`${approvedCount(t.id)}/${t.maxParticipants}`}
                                />
                                <MiniStat icon={LuDollarSign} label="Prize" value={money(t.prizePool)} />
                            </div>
                            <p className="mt-3 text-xs text-agl-gray">
                                Format: <span className="text-agl-white">{t.format}</span>
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <TournamentFormModal
                    tournament={editing}
                    onClose={() => setShowForm(false)}
                    onSave={save}
                />
            )}
        </div>
    );
}

/* ---------- Create / edit form ---------- */
function TournamentFormModal({
    tournament,
    onClose,
    onSave,
}: {
    tournament: Tournament | null;
    onClose: () => void;
    onSave: (draft: TournamentDraft) => void;
}) {
    const [form, setForm] = useState({
        name: tournament?.name ?? "",
        game: tournament?.game ?? GAMES[0],
        format: tournament?.format ?? FORMATS[0],
        status: (tournament?.status ?? "upcoming") as TournamentStatus,
        startDate: tournament ? toLocalInput(tournament.startDate) : "",
        prizePool: String(tournament?.prizePool ?? 0),
        maxParticipants: String(tournament?.maxParticipants ?? 16),
        description: tournament?.description ?? "",
    });

    const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const submit = () => {
        onSave({
            name: form.name.trim(),
            game: form.game,
            format: form.format,
            status: form.status,
            startDate: form.startDate
                ? new Date(form.startDate).toISOString()
                : new Date().toISOString(),
            prizePool: Number(form.prizePool) || 0,
            maxParticipants: Number(form.maxParticipants) || 16,
            description: form.description.trim(),
        });
    };

    return (
        <Modal
            onClose={onClose}
            title={tournament ? "Edit Tournament" : "Create Tournament"}
            subtitle={tournament ? "Update tournament details" : "Set up a new competitive event"}
            footer={
                <>
                    <button className={btnGhost} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={btnPrimary} onClick={submit} disabled={!form.name.trim()}>
                        <LuSave size={16} /> {tournament ? "Save Changes" : "Create"}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className={label}>Tournament Name</label>
                    <input
                        className={input}
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="AGL Winter Championship"
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className={label}>Game</label>
                        <select className={input} value={form.game} onChange={(e) => set("game", e.target.value)}>
                            {GAMES.map((g) => (
                                <option key={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={label}>Format</label>
                        <select className={input} value={form.format} onChange={(e) => set("format", e.target.value)}>
                            {FORMATS.map((f) => (
                                <option key={f}>{f}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className={label}>Status</label>
                        <select
                            className={input}
                            value={form.status}
                            onChange={(e) => set("status", e.target.value as TournamentStatus)}
                        >
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label className={label}>Start Date</label>
                        <input
                            type="datetime-local"
                            className={input}
                            value={form.startDate}
                            onChange={(e) => set("startDate", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className={label}>Prize Pool ($)</label>
                        <input
                            type="number"
                            min="0"
                            className={input}
                            value={form.prizePool}
                            onChange={(e) => set("prizePool", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={label}>Max Participants</label>
                        <input
                            type="number"
                            min="2"
                            className={input}
                            value={form.maxParticipants}
                            onChange={(e) => set("maxParticipants", e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className={label}>Description</label>
                    <textarea
                        className={`${input} min-h-[80px]`}
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Brief description of the tournament"
                    />
                </div>
            </div>
        </Modal>
    );
}