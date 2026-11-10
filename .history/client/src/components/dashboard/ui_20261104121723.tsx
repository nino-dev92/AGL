import { useEffect, useState, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { LuTrash2, LuX } from "react-icons/lu";
import type {
    DisputePriority,
    DisputeStatus,
    EscalationLevel,
    AnnouncementPriority,
    MatchStatus,
    MemberStatus,
    PlayerStatus,
    RegistrationStatus,
    TeamStatus,
    TournamentStatus,
} from "./store";

/* =====================================================================
   CLASS STRINGS
   ===================================================================== */
export const card = "rounded-xl border border-white/15 bg-white/[0.04]";
export const cardHover =
    "transition duration-200 hover:-translate-y-0.5 hover:border-agl-red";

const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";
export const btnPrimary = `${btnBase} bg-agl-red text-agl-white hover:bg-agl-red-light`;
export const btnGold = `${btnBase} bg-agl-yellow text-agl-black hover:opacity-90`;
export const btnGhost = `${btnBase} border border-white/15 text-agl-white hover:border-agl-red hover:text-agl-red`;
export const btnDanger = `${btnBase} border border-agl-red/40 bg-agl-red/10 text-agl-red hover:bg-agl-red/20`;
export const btnSmall = "px-3 py-1.5 text-xs";

export const input =
    "w-full rounded-lg border border-white/15 bg-agl-black/60 px-3 py-2 text-sm text-agl-white placeholder-agl-gray-dark transition-colors focus:border-agl-red focus:outline-none";
export const label =
    "mb-1.5 block text-xs font-bold uppercase tracking-wider text-agl-gray";

/* =====================================================================
   BADGES
   ===================================================================== */
const pill = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";

function Dot({ cls }: { cls: string }) {
    return <span className={`h-1.5 w-1.5 rounded-full ${cls}`} />;
}

const tournamentStyles: Record<TournamentStatus, { text: string; cls: string; dot: string }> = {
    upcoming: { text: "Upcoming", cls: "border-agl-yellow/40 bg-agl-yellow/10 text-agl-yellow", dot: "bg-agl-yellow" },
    ongoing: { text: "Live", cls: "border-agl-red/40 bg-agl-red/10 text-agl-red", dot: "bg-agl-red animate-pulse" },
    completed: { text: "Completed", cls: "border-white/15 bg-white/5 text-agl-gray", dot: "bg-agl-gray" },
};
export function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
    const s = tournamentStyles[status];
    return (
        <span className={`${pill} gap-1.5 ${s.cls}`}>
            <Dot cls={s.dot} />
            {s.text}
        </span>
    );
}

const matchStyles: Record<MatchStatus, { text: string; cls: string }> = {
    scheduled: { text: "Scheduled", cls: "border-white/15 bg-white/5 text-agl-gray" },
    ongoing: { text: "Live Now", cls: "border-agl-red/40 bg-agl-red/10 text-agl-red" },
    completed: { text: "Final", cls: "border-green-500/30 bg-green-500/10 text-green-400" },
};
export function MatchStatusBadge({ status }: { status: MatchStatus }) {
    const m = matchStyles[status];
    return <span className={`${pill} ${m.cls}`}>{m.text}</span>;
}

const priorityStyles: Record<AnnouncementPriority, { text: string; cls: string }> = {
    info: { text: "Info", cls: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
    warning: { text: "Warning", cls: "border-agl-yellow/40 bg-agl-yellow/10 text-agl-yellow" },
    critical: { text: "Critical", cls: "border-agl-red/40 bg-agl-red/10 text-agl-red" },
};
export function PriorityBadge({ priority }: { priority: AnnouncementPriority }) {
    const p = priorityStyles[priority];
    return <span className={`${pill} ${p.cls}`}>{p.text}</span>;
}

const playerStyles: Record<PlayerStatus, { text: string; cls: string; dot: string }> = {
    online: { text: "Online", cls: "text-green-400", dot: "bg-green-500 animate-pulse" },
    away: { text: "Away", cls: "text-agl-yellow", dot: "bg-agl-yellow" },
    offline: { text: "Offline", cls: "text-agl-gray", dot: "bg-agl-gray-dark" },
};
export function PlayerStatusBadge({ status }: { status: PlayerStatus }) {
    const p = playerStyles[status];
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${p.cls}`}>
            <span className={`h-2 w-2 rounded-full ${p.dot}`} />
            {p.text}
        </span>
    );
}

const rankStyles: Record<string, string> = {
    Master: "border-agl-red/40 bg-agl-red/10 text-agl-red",
    Diamond: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
    Platinum: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    Gold: "border-agl-yellow/40 bg-agl-yellow/10 text-agl-yellow",
    Silver: "border-white/20 bg-white/5 text-agl-white",
    Bronze: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    Unranked: "border-white/15 bg-white/5 text-agl-gray",
};
export function RankBadge({ rank }: { rank: string }) {
    return <span className={`${pill} ${rankStyles[rank] ?? rankStyles.Unranked}`}>{rank}</span>;
}

const registrationStyles: Record<RegistrationStatus, string> = {
    pending: "border-agl-yellow/40 bg-agl-yellow/10 text-agl-yellow",
    approved: "border-green-500/30 bg-green-500/10 text-green-400",
    rejected: "border-agl-red/40 bg-agl-red/10 text-agl-red",
};
export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
    return <span className={`${pill} capitalize ${registrationStyles[status]}`}>{status}</span>;
}

const teamStyles: Record<TeamStatus, string> = {
    active: "border-green-500/30 bg-green-500/10 text-green-400",
    suspended: "border-agl-red/40 bg-agl-red/10 text-agl-red",
    disbanded: "border-white/15 bg-white/5 text-agl-gray",
};
export function TeamStatusBadge({ status }: { status: TeamStatus }) {
    return <span className={`${pill} capitalize ${teamStyles[status]}`}>{status}</span>;
}

const memberStyles: Record<MemberStatus, string> = {
    active: "border-green-500/30 bg-green-500/10 text-green-400",
    benched: "border-agl-yellow/40 bg-agl-yellow/10 text-agl-yellow",
    removed: "border-agl-red/40 bg-agl-red/10 text-agl-red",
};
export function MemberStatusBadge({ status }: { status: MemberStatus }) {
    return <span className={`${pill} capitalize ${memberStyles[status]}`}>{status}</span>;
}

export function SuspendedTag() {
    return (
        <span className={`${pill} border-agl-red/40 bg-agl-red/10 uppercase tracking-wide text-agl-red`}>
            Suspended
        </span>
    );
}

export function ActiveBadge({ active }: { active: boolean }) {
    return active ? (
        <span className={`${pill} border-green-500/30 bg-green-500/10 text-green-400`}>Active</span>
    ) : (
        <span className={`${pill} border-white/15 bg-white/5 text-agl-gray`}>Inactive</span>
    );
}

const escalationStyles: Record<EscalationLevel, string> = {
    none: "border-white/15 bg-white/5 text-agl-gray",
    low: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    medium: "border-agl-yellow/40 bg-agl-yellow/10 text-agl-yellow",
    high: "border-agl-red/40 bg-agl-red/10 text-agl-red",
};
export function EscalationBadge({ level }: { level: EscalationLevel }) {
    return (
        <span className={`${pill} capitalize ${escalationStyles[level]}`}>
            {level === "none" ? "No escalation" : `${level} escalation`}
        </span>
    );
}

const disputeStatusStyles: Record<DisputeStatus, string> = {
    open: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    reviewing: "border-agl-yellow/40 bg-agl-yellow/10 text-agl-yellow",
    escalated: "border-agl-red/40 bg-agl-red/10 text-agl-red",
    closed: "border-green-500/30 bg-green-500/10 text-green-400",
};
export function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
    return <span className={`${pill} capitalize ${disputeStatusStyles[status]}`}>{status}</span>;
}

const disputePriorityStyles: Record<DisputePriority, string> = {
    low: "text-agl-gray",
    medium: "text-agl-yellow",
    high: "text-orange-400",
    critical: "text-agl-red",
};
export function PriorityPill({ priority }: { priority: DisputePriority }) {
    return (
        <span className={`text-xs font-bold uppercase tracking-wider ${disputePriorityStyles[priority]}`}>
            {priority} priority
        </span>
    );
}

/* =====================================================================
   SMALL PIECES
   ===================================================================== */
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
    return (
        <div
            className="flex shrink-0 items-center justify-center rounded-full bg-agl-red/20 font-black uppercase text-agl-red"
            style={{ width: size, height: size, fontSize: size * 0.42 }}
        >
            {name.charAt(0)}
        </div>
    );
}

export function KdPill({ kd }: { kd: number }) {
    const cls =
        kd >= 2
            ? "border-agl-yellow/30 bg-agl-yellow/10 text-agl-yellow"
            : kd >= 1
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-agl-red/30 bg-agl-red/10 text-agl-red";
    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-sm font-bold ${cls}`}>
            {kd.toFixed(2)}
        </span>
    );
}

/** A label and a value on one line. */
export function Row({ label: text, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-agl-gray">{text}</span>
            <span className="font-semibold text-agl-white">{value}</span>
        </div>
    );
}

export function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: IconType;
    title: string;
    description?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Icon size={40} className="text-agl-gray-dark" />
            <p className="text-lg font-black uppercase tracking-tight text-agl-white">{title}</p>
            {description && <p className="max-w-sm text-sm text-agl-gray">{description}</p>}
        </div>
    );
}

export function StatCard({
    icon: Icon,
    label: text,
    value,
    sub,
    accent = "text-agl-white",
    iconClass = "bg-white/5 text-agl-gray",
    onClick,
}: {
    icon: IconType;
    label: string;
    value: string;
    sub?: string;
    accent?: string;
    iconClass?: string;
    onClick?: () => void;
}) {
    const body = (
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-agl-gray">{text}</p>
                <p className={`mt-1 truncate text-3xl font-black ${accent}`}>{value}</p>
                {sub && <p className="mt-0.5 text-xs text-agl-gray-dark">{sub}</p>}
            </div>
            <div className={`rounded-lg p-2.5 ${iconClass}`}>
                <Icon size={20} />
            </div>
        </div>
    );
    return onClick ? (
        <button onClick={onClick} className={`${card} ${cardHover} w-full p-4 text-left`}>
            {body}
        </button>
    ) : (
        <div className={`${card} p-4`}>{body}</div>
    );
}

export function MiniStat({
    icon: Icon,
    label: text,
    value,
}: {
    icon: IconType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <Icon size={14} className="text-agl-gray" />
            <span className="text-xs text-agl-gray">{text}</span>
            <span className="text-sm font-semibold text-agl-white">{value}</span>
        </div>
    );
}

/** Trash icon that asks "Delete / No" before it deletes. */
export function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
    const [confirming, setConfirming] = useState(false);

    if (confirming) {
        return (
            <div className="flex items-center gap-1 rounded-lg bg-agl-red/10 px-1 py-0.5">
                <button
                    onClick={onConfirm}
                    className="rounded px-1.5 py-1 text-xs font-bold text-agl-red hover:text-agl-red-light"
                >
                    Delete
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="rounded px-1.5 py-1 text-xs text-agl-gray hover:text-agl-white"
                >
                    No
                </button>
            </div>
        );
    }
    return (
        <button
            aria-label="Delete"
            onClick={() => setConfirming(true)}
            className="rounded-lg p-2 text-agl-gray transition-colors hover:bg-white/5 hover:text-agl-red"
        >
            <LuTrash2 size={16} />
        </button>
    );
}

/* =====================================================================
   TAB BAR AND FILTER PILLS
   ===================================================================== */
export function TabBar<T extends string>({
    tabs,
    value,
    onChange,
}: {
    tabs: { id: T; label: string; icon: IconType }[];
    value: T;
    onChange: (id: T) => void;
}) {
    return (
        <div className="flex flex-wrap gap-1 self-start rounded-xl border border-white/15 bg-white/[0.04] p-1">
            {tabs.map((t) => {
                const Icon = t.icon;
                const active = value === t.id;
                return (
                    <button
                        key={t.id}
                        onClick={() => onChange(t.id)}
                        aria-label={t.label}
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${active
                                ? "bg-agl-red text-agl-white"
                                : "text-agl-gray hover:bg-white/5 hover:text-agl-white"
                            }`}
                    >
                        <Icon size={16} />
                        <span className="hidden sm:inline">{t.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

export function Pills<T extends string>({
    options,
    value,
    onChange,
}: {
    options: readonly T[];
    value: T;
    onChange: (v: T) => void;
}) {
    return (
        <div className="flex gap-1 rounded-lg border border-white/15 bg-agl-black/60 p-1">
            {options.map((o) => (
                <button
                    key={o}
                    onClick={() => onChange(o)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition ${value === o ? "bg-agl-red text-agl-white" : "text-agl-gray hover:text-agl-white"
                        }`}
                >
                    {o}
                </button>
            ))}
        </div>
    );
}

/* =====================================================================
   MODAL
   ===================================================================== */
type ModalProps = {
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: ReactNode;
    footer?: ReactNode;
};

export function Modal({ onClose, title, subtitle, children, footer }: ModalProps) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-white/15 bg-agl-black">
                <div className="flex items-start justify-between border-b border-white/15 px-5 py-4">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-agl-white">{title}</h3>
                        {subtitle && <p className="mt-0.5 text-sm text-agl-gray">{subtitle}</p>}
                    </div>
                    <button
                        aria-label="Close"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-agl-gray transition-colors hover:bg-white/5 hover:text-agl-white"
                    >
                        <LuX size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
                {footer && (
                    <div className="flex justify-end gap-2 border-t border-white/15 px-5 py-4">{footer}</div>
                )}
            </div>
        </div>
    );
}