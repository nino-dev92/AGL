import { useState } from "react";
import { LuScrollText, LuSearch } from "react-icons/lu";
import { useDashboard } from "../store";
import { EmptyState, card, input } from "../ui";

/** Colored action label, also used by the Overview tab. */
export function ActionLabel({ action }: { action: string }) {
    const a = action.toUpperCase();
    const tone =
        /SUSPEND|DELETE|REJECT|DISBAND|DEACTIVATE|REMOVED/.test(a)
            ? "border-agl-red/40 bg-agl-red/10 text-agl-red"
            : /REINSTATE|ACTIVATE|ADD|CLOSE/.test(a)
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : /ESCALATE|CORRECT|UPDATE|ASSIGN|STATUS/.test(a)
                    ? "border-agl-yellow/40 bg-agl-yellow/10 text-agl-yellow"
                    : "border-white/15 bg-white/5 text-agl-gray";
    return (
        <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wide ${tone}`}
        >
            {action.replace(/_/g, " ")}
        </span>
    );
}

export const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function AuditPanel() {
    const { auditLog } = useDashboard();
    const [search, setSearch] = useState("");
    const [entity, setEntity] = useState("all");

    const entityTypes = Array.from(new Set(auditLog.map((e) => e.entityType)));

    const q = search.trim().toLowerCase();
    const shown = [...auditLog]
        .filter((e) => entity === "all" || e.entityType === entity)
        .filter(
            (e) =>
                !q ||
                e.description.toLowerCase().includes(q) ||
                e.entityId.toLowerCase().includes(q) ||
                e.action.toLowerCase().includes(q) ||
                e.actor.toLowerCase().includes(q),
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight text-agl-white">Audit Log</h3>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative">
                        <LuSearch
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-agl-gray"
                        />
                        <input
                            className={`${input} pl-9 sm:w-64`}
                            placeholder="Search the log…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className={`${input} sm:w-48`}
                        value={entity}
                        onChange={(e) => setEntity(e.target.value)}
                    >
                        <option value="all">All entity types</option>
                        {entityTypes.map((t) => (
                            <option key={t} value={t}>
                                {t.replace(/_/g, " ")}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {shown.length === 0 ? (
                <div className={card}>
                    <EmptyState
                        icon={LuScrollText}
                        title="No audit entries"
                        description="Admin actions will be recorded here."
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    {shown.map((e) => (
                        <div key={e.id} className={`${card} p-4`}>
                            <div className="flex flex-wrap items-center gap-2">
                                <ActionLabel action={e.action} />
                                <span className="text-xs text-agl-gray">
                                    {e.entityType.replace(/_/g, " ")} ·{" "}
                                    <span className="font-semibold text-agl-white">{e.entityId}</span>
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-agl-white">{e.description}</p>
                            <p className="mt-1 text-xs text-agl-gray">
                                {e.actor} · {fmtDateTime(e.createdAt)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}