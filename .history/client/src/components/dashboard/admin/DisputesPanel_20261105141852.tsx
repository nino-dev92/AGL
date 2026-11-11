import { useState } from "react";
import { LuCircleCheck, LuFlame, LuScale, LuUserCheck } from "react-icons/lu";
import { useDashboard } from "../store";
import type { Dispute, DisputePriority } from "../model";
import {
    DisputeStatusBadge,
    EmptyState,
    Modal,
    PriorityPill,
    btnDanger,
    btnGhost,
    btnPrimary,
    btnSmall,
    card,
    cardHover,
    input,
    label,
} from "../ui";

type Action = { type: "assign" | "escalate" | "close"; dispute: Dispute } | null;

const PRIORITIES: DisputePriority[] = ["low", "medium", "high", "critical"];

export default function DisputesPanel() {
    const { disputes, tournaments, assignDispute, escalateDispute, closeDispute } = useDashboard();
    const [action, setAction] = useState<Action>(null);

    const sorted = [...disputes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const close = () => setAction(null);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight text-agl-white">
                Dispute Resolution
            </h3>

            {sorted.length === 0 ? (
                <div className={card}>
                    <EmptyState icon={LuScale} title="No disputes" description="Filed disputes will appear here." />
                </div>
            ) : (
                <div className="space-y-3">
                    {sorted.map((d) => {
                        const tournament = tournaments.find((t) => t.id === d.relatedTournamentId);
                        return (
                            <div key={d.id} className={`${card} ${cardHover} p-4`}>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-agl-yellow">{d.caseNumber}</span>
                                    <DisputeStatusBadge status={d.status} />
                                    <PriorityPill priority={d.priority} />
                                </div>

                                <h4 className="mt-2 font-semibold text-agl-white">{d.title}</h4>
                                <p className="mt-1 text-sm text-agl-gray">{d.description}</p>

                                <p className="mt-2 text-xs text-agl-gray">
                                    Filed by <span className="text-agl-white">{d.filedBy}</span> · Assigned to{" "}
                                    <span className="text-agl-white">{d.assignedTo || "Unassigned"}</span>
                                    {tournament && (
                                        <>
                                            {" "}
                                            · <span className="text-agl-white">{tournament.name}</span>
                                        </>
                                    )}{" "}
                                    · {new Date(d.createdAt).toLocaleDateString()}
                                </p>

                                {d.status === "closed" && d.resolution && (
                                    <div className="mt-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
                                        <span className="font-bold">Resolution: </span>
                                        {d.resolution}
                                    </div>
                                )}

                                {d.status !== "closed" && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button
                                            className={`${btnGhost} ${btnSmall}`}
                                            onClick={() => setAction({ type: "assign", dispute: d })}
                                        >
                                            <LuUserCheck size={14} /> Assign
                                        </button>
                                        <button
                                            className={`${btnDanger} ${btnSmall}`}
                                            onClick={() => setAction({ type: "escalate", dispute: d })}
                                        >
                                            <LuFlame size={14} /> Escalate
                                        </button>
                                        <button
                                            className={`${btnPrimary} ${btnSmall}`}
                                            onClick={() => setAction({ type: "close", dispute: d })}
                                        >
                                            <LuCircleCheck size={14} /> Close
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {action?.type === "assign" && (
                <AssignModal
                    dispute={action.dispute}
                    onClose={close}
                    onSave={(name) => {
                        assignDispute(action.dispute.id, name);
                        close();
                    }}
                />
            )}
            {action?.type === "escalate" && (
                <EscalateModal
                    dispute={action.dispute}
                    onClose={close}
                    onSave={(priority) => {
                        escalateDispute(action.dispute.id, priority);
                        close();
                    }}
                />
            )}
            {action?.type === "close" && (
                <CloseModal
                    dispute={action.dispute}
                    onClose={close}
                    onSave={(resolution) => {
                        closeDispute(action.dispute.id, resolution);
                        close();
                    }}
                />
            )}
        </div>
    );
}

function AssignModal({
    dispute,
    onClose,
    onSave,
}: {
    dispute: Dispute;
    onClose: () => void;
    onSave: (name: string) => void;
}) {
    const [name, setName] = useState(dispute.assignedTo === "Unassigned" ? "" : dispute.assignedTo);
    return (
        <Modal
            onClose={onClose}
            title="Assign Dispute"
            subtitle={dispute.caseNumber}
            footer={
                <>
                    <button className={btnGhost} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={btnPrimary} disabled={!name.trim()} onClick={() => onSave(name.trim())}>
                        <LuUserCheck size={16} /> Assign
                    </button>
                </>
            }
        >
            <label className={label}>Assign to</label>
            <input
                className={input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name of the reviewer"
            />
        </Modal>
    );
}

function EscalateModal({
    dispute,
    onClose,
    onSave,
}: {
    dispute: Dispute;
    onClose: () => void;
    onSave: (priority: DisputePriority) => void;
}) {
    const [priority, setPriority] = useState<DisputePriority>("high");
    return (
        <Modal
            onClose={onClose}
            title="Escalate Dispute"
            subtitle={dispute.caseNumber}
            footer={
                <>
                    <button className={btnGhost} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={btnDanger} onClick={() => onSave(priority)}>
                        <LuFlame size={16} /> Escalate
                    </button>
                </>
            }
        >
            <label className={label}>New priority</label>
            <select
                className={`${input} capitalize`}
                value={priority}
                onChange={(e) => setPriority(e.target.value as DisputePriority)}
            >
                {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                        {p}
                    </option>
                ))}
            </select>
        </Modal>
    );
}

function CloseModal({
    dispute,
    onClose,
    onSave,
}: {
    dispute: Dispute;
    onClose: () => void;
    onSave: (resolution: string) => void;
}) {
    const [resolution, setResolution] = useState("");
    return (
        <Modal
            onClose={onClose}
            title="Close Dispute"
            subtitle={dispute.caseNumber}
            footer={
                <>
                    <button className={btnGhost} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={btnPrimary}
                        disabled={!resolution.trim()}
                        onClick={() => onSave(resolution.trim())}
                    >
                        <LuCircleCheck size={16} /> Close Case
                    </button>
                </>
            }
        >
            <label className={label}>Resolution</label>
            <textarea
                className={`${input} min-h-[100px]`}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe how this dispute was resolved…"
            />
        </Modal>
    );
}