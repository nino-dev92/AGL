import { useState } from "react";
import { LuSearch, LuShieldCheck, LuTriangleAlert, LuUsers } from "react-icons/lu";
import { useDashboard } from "../store";
import { kdOf, type Player } from "../model";
import {
    Avatar,
    EmptyState,
    Modal,
    Pills,
    RankBadge,
    SuspendedTag,
    btnDanger,
    btnGhost,
    btnPrimary,
    btnSmall,
    card,
    cardHover,
    input,
    label,
} from "../ui";

const FILTERS = ["all", "active", "suspended"] as const;
type Filter = (typeof FILTERS)[number];

export default function UsersPanel() {
    const { players, suspendPlayer, reinstatePlayer } = useDashboard();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Filter>("all");
    const [suspending, setSuspending] = useState<Player | null>(null);
    const [reinstating, setReinstating] = useState<Player | null>(null);

    const q = search.trim().toLowerCase();
    const shown = players
        .filter((p) => filter === "all" || (filter === "suspended" ? p.isSuspended : !p.isSuspended))
        .filter((p) => !q || p.username.toLowerCase().includes(q))
        .sort((a, b) => a.username.localeCompare(b.username));

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight text-agl-white">
                    User Management
                </h3>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative">
                        <LuSearch
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-agl-gray"
                        />
                        <input
                            className={`${input} pl-9 sm:w-56`}
                            placeholder="Search users…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Pills options={FILTERS} value={filter} onChange={setFilter} />
                </div>
            </div>

            {shown.length === 0 ? (
                <div className={card}>
                    <EmptyState icon={LuUsers} title="No users found" description="Try another search or filter." />
                </div>
            ) : (
                <div className="space-y-3">
                    {shown.map((p) => (
                        <div
                            key={p.id}
                            className={`${card} ${cardHover} p-4 ${p.isSuspended ? "border-agl-red/30" : ""}`}
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                    <Avatar name={p.username} size={40} />
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-agl-white">{p.username}</span>
                                            {p.isSuspended && <SuspendedTag />}
                                            <RankBadge rank={p.rankTier} />
                                        </div>
                                        {p.isSuspended ? (
                                            <p className="mt-1 text-sm text-agl-red">
                                                {p.suspendedAt && `Suspended ${new Date(p.suspendedAt).toLocaleDateString()}: `}
                                                {p.suspensionReason || "No reason given"}
                                            </p>
                                        ) : (
                                            <p className="mt-1 text-sm text-agl-gray">
                                                KD {kdOf(p.kills, p.deaths).toFixed(2)} · {p.wins}W / {p.losses}L ·{" "}
                                                {p.matchesPlayed} matches
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {p.isSuspended ? (
                                    <button className={`${btnGhost} ${btnSmall}`} onClick={() => setReinstating(p)}>
                                        <LuShieldCheck size={14} /> Reinstate
                                    </button>
                                ) : (
                                    <button className={`${btnDanger} ${btnSmall}`} onClick={() => setSuspending(p)}>
                                        <LuTriangleAlert size={14} /> Suspend
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {suspending && (
                <SuspendModal
                    player={suspending}
                    onClose={() => setSuspending(null)}
                    onConfirm={(reason) => {
                        suspendPlayer(suspending.id, reason);
                        setSuspending(null);
                    }}
                />
            )}

            {reinstating && (
                <Modal
                    onClose={() => setReinstating(null)}
                    title="Reinstate Player"
                    subtitle={reinstating.username}
                    footer={
                        <>
                            <button className={btnGhost} onClick={() => setReinstating(null)}>
                                Cancel
                            </button>
                            <button
                                className={btnPrimary}
                                onClick={() => {
                                    reinstatePlayer(reinstating.id);
                                    setReinstating(null);
                                }}
                            >
                                <LuShieldCheck size={16} /> Reinstate
                            </button>
                        </>
                    }
                >
                    <p className="text-sm text-agl-gray">
                        Lift the suspension on <span className="font-semibold text-agl-white">{reinstating.username}</span>?
                        They will be able to compete again, and the action is recorded in the audit log.
                    </p>
                </Modal>
            )}
        </div>
    );
}

function SuspendModal({
    player,
    onClose,
    onConfirm,
}: {
    player: Player;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}) {
    const [reason, setReason] = useState("");

    return (
        <Modal
            onClose={onClose}
            title="Suspend Player"
            subtitle={player.username}
            footer={
                <>
                    <button className={btnGhost} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={btnDanger}
                        disabled={!reason.trim()}
                        onClick={() => onConfirm(reason.trim())}
                    >
                        <LuTriangleAlert size={16} /> Suspend
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="flex gap-3 rounded-lg border border-agl-red/40 bg-agl-red/10 p-3 text-sm text-agl-red">
                    <LuTriangleAlert size={18} className="mt-0.5 shrink-0" />
                    <p>
                        This flags the player as suspended and the action is recorded in the audit log. A
                        reason is required.
                    </p>
                </div>
                <div>
                    <label className={label}>Reason for suspension</label>
                    <textarea
                        className={`${input} min-h-[90px]`}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Describe the violation…"
                    />
                </div>
            </div>
        </Modal>
    );
}