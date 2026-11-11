import { useState } from "react";
import { LuBuilding2, LuPlus, LuUserPlus } from "react-icons/lu";
import { useDashboard } from "../store";
import type { MemberRole, Team, TeamStatus } from "../model";
import {
    Avatar,
    EmptyState,
    MemberStatusBadge,
    Modal,
    SuspendedTag,
    TeamStatusBadge,
    btnDanger,
    btnGhost,
    btnGold,
    btnSmall,
    card,
    input,
    label,
} from "../ui";

const STATUS_ACTIONS: { status: TeamStatus; label: string; danger?: boolean }[] = [
    { status: "active", label: "Mark Active" },
    { status: "suspended", label: "Suspend", danger: true },
    { status: "disbanded", label: "Mark Disbanded", danger: true },
];

export default function TeamsPanel() {
    const { teams, memberships, players, setTeamStatus, setMemberStatus } = useDashboard();
    const [selected, setSelected] = useState(teams[0]?.id ?? "");
    const [showAdd, setShowAdd] = useState(false);

    const team: Team | undefined = teams.find((t) => t.id === selected) ?? teams[0];
    const roster = team ? memberships.filter((m) => m.teamId === team.id) : [];

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight text-agl-white">
                Team Management
            </h3>

            {teams.length === 0 ? (
                <div className={card}>
                    <EmptyState icon={LuBuilding2} title="No teams yet" description="Teams created by managers appear here." />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
                    {/* Team list */}
                    <div className="space-y-2">
                        {teams.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setSelected(t.id)}
                                className={`w-full rounded-xl border p-3 text-left transition ${team?.id === t.id
                                        ? "border-agl-red bg-agl-red/10"
                                        : "border-white/15 bg-white/[0.04] hover:border-agl-red/60"
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-agl-white">{t.name}</span>
                                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-bold text-agl-yellow">
                                        {t.tag}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-agl-gray">{t.country}</span>
                                    <TeamStatusBadge status={t.status} />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Detail */}
                    {team && (
                        <div className={`${card} space-y-5 p-5`}>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-2xl font-black uppercase tracking-tight text-agl-white">
                                        {team.name}
                                    </h4>
                                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-bold text-agl-yellow">
                                        {team.tag}
                                    </span>
                                    <TeamStatusBadge status={team.status} />
                                </div>
                                <p className="mt-1 text-sm text-agl-gray">{team.country}</p>
                                {team.description && (
                                    <p className="mt-2 text-sm text-agl-gray">{team.description}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {STATUS_ACTIONS.filter((a) => a.status !== team.status).map((a) => (
                                    <button
                                        key={a.status}
                                        className={`${a.danger ? btnDanger : btnGhost} ${btnSmall}`}
                                        onClick={() => setTeamStatus(team.id, a.status)}
                                    >
                                        {a.label}
                                    </button>
                                ))}
                                <button className={`${btnGold} ${btnSmall}`} onClick={() => setShowAdd(true)}>
                                    <LuUserPlus size={14} /> Add Member
                                </button>
                            </div>

                            <div>
                                <h5 className="mb-3 text-sm font-bold uppercase tracking-wider text-agl-gray">
                                    Roster ({roster.length})
                                </h5>
                                {roster.length === 0 ? (
                                    <p className="text-sm text-agl-gray">No members on this team yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {roster.map((m) => {
                                            const p = players.find((x) => x.id === m.playerId);
                                            return (
                                                <div
                                                    key={m.id}
                                                    className="flex flex-col gap-2 rounded-lg border border-white/15 bg-agl-black/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={p?.username ?? "?"} size={32} />
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-sm font-semibold text-agl-white">
                                                                    {p?.username ?? "Unknown player"}
                                                                </span>
                                                                {p?.isSuspended && <SuspendedTag />}
                                                            </div>
                                                            <p className="text-xs capitalize text-agl-gray">{m.role}</p>
                                                        </div>
                                                        <MemberStatusBadge status={m.status} />
                                                    </div>

                                                    <div className="flex flex-wrap gap-1.5">
                                                        {m.status !== "active" && (
                                                            <button
                                                                className={`${btnGhost} ${btnSmall}`}
                                                                onClick={() => setMemberStatus(m.id, "active")}
                                                            >
                                                                Activate
                                                            </button>
                                                        )}
                                                        {m.status !== "benched" && (
                                                            <button
                                                                className={`${btnGhost} ${btnSmall}`}
                                                                onClick={() => setMemberStatus(m.id, "benched")}
                                                            >
                                                                Bench
                                                            </button>
                                                        )}
                                                        {m.status !== "removed" && (
                                                            <button
                                                                className={`${btnDanger} ${btnSmall}`}
                                                                onClick={() => setMemberStatus(m.id, "removed")}
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showAdd && team && <AddMemberModal team={team} onClose={() => setShowAdd(false)} />}
        </div>
    );
}

function AddMemberModal({ team, onClose }: { team: Team; onClose: () => void }) {
    const { players, addMember, logAudit } = useDashboard();
    const sorted = [...players].sort((a, b) => a.username.localeCompare(b.username));
    const [playerId, setPlayerId] = useState(sorted[0]?.id ?? "");
    const [role, setRole] = useState<MemberRole>("member");
    const [error, setError] = useState("");

    const submit = () => {
        const result = addMember(team.id, playerId, role);
        if (result) {
            setError(result);
            return;
        }
        const p = players.find((x) => x.id === playerId);
        logAudit({
            action: "ADD_MEMBER",
            entityType: "team_membership",
            entityId: team.name,
            description: `Added ${p?.username ?? "player"} to ${team.name} as ${role}.`,
        });
        onClose();
    };

    return (
        <Modal
            onClose={onClose}
            title="Add Member"
            subtitle={team.name}
            footer={
                <>
                    <button className={btnGhost} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={btnGold} onClick={submit} disabled={!playerId}>
                        <LuPlus size={16} /> Add Member
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className={label}>Player</label>
                    <select
                        className={input}
                        value={playerId}
                        onChange={(e) => {
                            setPlayerId(e.target.value);
                            setError("");
                        }}
                    >
                        {sorted.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.username}
                                {p.isSuspended ? " (suspended)" : ""}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={label}>Role</label>
                    <select
                        className={input}
                        value={role}
                        onChange={(e) => setRole(e.target.value as MemberRole)}
                    >
                        <option value="captain">Captain</option>
                        <option value="member">Member</option>
                        <option value="coach">Coach</option>
                    </select>
                </div>
                {error && <p className="text-sm text-agl-red">{error}</p>}
            </div>
        </Modal>
    );
}