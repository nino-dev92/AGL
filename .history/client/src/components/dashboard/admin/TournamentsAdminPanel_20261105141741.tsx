import { useState } from "react";
import { LuGamepad2, LuSave, LuSettings2, LuTrophy } from "react-icons/lu";
import { useDashboard } from "../store";
import type { EscalationLevel, Tournament } from "../model";
import {
    EmptyState,
    EscalationBadge,
    Modal,
    TournamentStatusBadge,
    btnGhost,
    btnPrimary,
    btnSmall,
    card,
    cardHover,
    input,
    label,
} from "../ui";

const LEVELS: EscalationLevel[] = ["none", "low", "medium", "high"];

export default function TournamentsAdminPanel() {
    const { tournaments, setEscalation } = useDashboard();
    const [managing, setManaging] = useState<Tournament | null>(null);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight text-agl-white">
                Tournament Oversight
            </h3>

            {tournaments.length === 0 ? (
                <div className={card}>
                    <EmptyState icon={LuTrophy} title="No tournaments" description="Organizers create tournaments in the Organizer view." />
                </div>
            ) : (
                <div className="space-y-3">
                    {tournaments.map((t) => (
                        <div key={t.id} className={`${card} ${cardHover} p-4`}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <TournamentStatusBadge status={t.status} />
                                        <EscalationBadge level={t.escalationLevel} />
                                        <span className="inline-flex items-center gap-1.5 text-xs text-agl-gray">
                                            <LuGamepad2 size={12} /> {t.game}
                                        </span>
                                    </div>
                                    <h4 className="font-black uppercase tracking-tight text-agl-white">{t.name}</h4>
                                    {t.escalationNotes && (
                                        <p className="mt-1 text-sm text-agl-yellow">{t.escalationNotes}</p>
                                    )}
                                </div>
                                <button className={`${btnGhost} ${btnSmall}`} onClick={() => setManaging(t)}>
                                    <LuSettings2 size={14} /> Manage
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {managing && (
                <ManageModal
                    tournament={managing}
                    onClose={() => setManaging(null)}
                    onSave={(level, notes) => {
                        setEscalation(managing.id, level, notes);
                        setManaging(null);
                    }}
                />
            )}
        </div>
    );
}

function ManageModal({
    tournament,
    onClose,
    onSave,
}: {
    tournament: Tournament;
    onClose: () => void;
    onSave: (level: EscalationLevel, notes: string) => void;
}) {
    const [level, setLevel] = useState<EscalationLevel>(tournament.escalationLevel);
    const [notes, setNotes] = useState(tournament.escalationNotes);

    return (
        <Modal
            onClose={onClose}
            title="Manage Tournament"
            subtitle={tournament.name}
            footer={
                <>
                    <button className={btnGhost} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={btnPrimary} onClick={() => onSave(level, notes.trim())}>
                        <LuSave size={16} /> Save
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className={label}>Escalation level</label>
                    <select
                        className={`${input} capitalize`}
                        value={level}
                        onChange={(e) => setLevel(e.target.value as EscalationLevel)}
                    >
                        {LEVELS.map((l) => (
                            <option key={l} value={l}>
                                {l}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={label}>Notes</label>
                    <textarea
                        className={`${input} min-h-[90px]`}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Why is this tournament escalated?"
                    />
                </div>
                <p className="text-xs text-agl-gray">Changes are recorded in the audit log.</p>
            </div>
        </Modal>
    );
}