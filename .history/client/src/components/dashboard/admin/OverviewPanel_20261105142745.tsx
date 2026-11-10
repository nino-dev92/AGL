import type { ReactNode } from "react";
import {
    LuBuilding2,
    LuFlame,
    LuGavel,
    LuScale,
    LuShieldAlert,
    LuTrophy,
    LuUserCog,
    LuUserX,
    LuUsers,
    LuUsersRound,
} from "react-icons/lu";
import { useDashboard } from "../store";
import { Row, StatCard, card } from "../ui";
import { ActionLabel, fmtDateTime } from "./AuditPanel";

type Target = "users" | "teams" | "tournaments" | "disputes" | "organizers" | "audit";

export default function OverviewPanel({ onNavigate }: { onNavigate: (tab: Target) => void }) {
    const { players, teams, tournaments, disputes, organizers, auditLog } = useDashboard();

    const suspendedUsers = players.filter((p) => p.isSuspended).length;
    const openDisputes = disputes.filter((d) => d.status === "open" || d.status === "reviewing").length;
    const escalatedDisputes = disputes.filter((d) => d.status === "escalated").length;
    const activeOrganizers = organizers.filter((o) => o.isActive).length;
    const suspendedTeams = teams.filter((t) => t.status === "suspended").length;
    const escalatedTournaments = tournaments.filter((t) => t.escalationLevel !== "none").length;

    const alertCard = (n: number) => ({
        accent: n > 0 ? "text-agl-red" : "text-agl-white",
        iconClass: n > 0 ? "bg-agl-red/10 text-agl-red" : "bg-white/5 text-agl-gray",
    });

    const recent = [...auditLog]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4);

    return (
        <div className="space-y-6">
            {/* Alert cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <StatCard
                    icon={LuUserX}
                    label="Suspended Users"
                    value={String(suspendedUsers)}
                    sub="manage in Users"
                    onClick={() => onNavigate("users")}
                    {...alertCard(suspendedUsers)}
                />
                <StatCard
                    icon={LuScale}
                    label="Open Disputes"
                    value={String(openDisputes)}
                    sub="open or under review"
                    onClick={() => onNavigate("disputes")}
                    {...alertCard(openDisputes)}
                />
                <StatCard
                    icon={LuFlame}
                    label="Escalated Disputes"
                    value={String(escalatedDisputes)}
                    sub="need a decision"
                    onClick={() => onNavigate("disputes")}
                    {...alertCard(escalatedDisputes)}
                />
                <StatCard
                    icon={LuUserCog}
                    label="Active Organizers"
                    value={String(activeOrganizers)}
                    sub={`${organizers.length} total`}
                    accent="text-green-400"
                    iconClass="bg-green-500/10 text-green-400"
                    onClick={() => onNavigate("organizers")}
                />
                <StatCard
                    icon={LuBuilding2}
                    label="Suspended Teams"
                    value={String(suspendedTeams)}
                    sub="manage in Teams"
                    onClick={() => onNavigate("teams")}
                    {...alertCard(suspendedTeams)}
                />
                <StatCard
                    icon={LuShieldAlert}
                    label="Escalated Tournaments"
                    value={String(escalatedTournaments)}
                    sub="flagged for review"
                    onClick={() => onNavigate("tournaments")}
                    {...alertCard(escalatedTournaments)}
                />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    icon={<LuUsers size={18} />}
                    title="Users"
                    linkLabel="Go to Users"
                    onGo={() => onNavigate("users")}
                >
                    <Row label="Total players" value={players.length} />
                    <Row label="Online now" value={players.filter((p) => p.status === "online").length} />
                    <Row label="Suspended" value={suspendedUsers} />
                </SummaryCard>

                <SummaryCard
                    icon={<LuGavel size={18} />}
                    title="Disputes"
                    linkLabel="Go to Disputes"
                    onGo={() => onNavigate("disputes")}
                >
                    <Row label="Total cases" value={disputes.length} />
                    <Row label="Open or in review" value={openDisputes} />
                    <Row label="Closed" value={disputes.filter((d) => d.status === "closed").length} />
                </SummaryCard>

                <SummaryCard
                    icon={<LuUsersRound size={18} />}
                    title="Organizers"
                    linkLabel="Go to Organizers"
                    onGo={() => onNavigate("organizers")}
                >
                    <Row label="Total" value={organizers.length} />
                    <Row label="Active" value={activeOrganizers} />
                    <Row label="Inactive" value={organizers.length - activeOrganizers} />
                </SummaryCard>

                <SummaryCard
                    icon={<LuTrophy size={18} />}
                    title="Recent Audit Activity"
                    linkLabel="Open Audit Log"
                    onGo={() => onNavigate("audit")}
                >
                    {recent.length === 0 ? (
                        <p className="text-sm text-agl-gray">No activity yet.</p>
                    ) : (
                        recent.map((e) => (
                            <div key={e.id} className="space-y-1">
                                <ActionLabel action={e.action} />
                                <p className="line-clamp-2 text-xs text-agl-gray">{e.description}</p>
                                <p className="text-[11px] text-agl-gray-dark">{fmtDateTime(e.createdAt)}</p>
                            </div>
                        ))
                    )}
                </SummaryCard>
            </div>
        </div>
    );
}

function SummaryCard({
    icon,
    title,
    linkLabel,
    onGo,
    children,
}: {
    icon: ReactNode;
    title: string;
    linkLabel: string;
    onGo: () => void;
    children: ReactNode;
}) {
    return (
        <div className={`${card} flex flex-col p-5`}>
            <div className="mb-4 flex items-center gap-2 text-agl-red">
                {icon}
                <h3 className="text-lg font-black uppercase tracking-tight text-agl-white">{title}</h3>
            </div>
            <div className="flex-1 space-y-3">{children}</div>
            <button
                onClick={onGo}
                className="mt-4 self-start text-sm font-semibold text-agl-red transition-colors hover:text-agl-red-light"
            >
                {linkLabel} →
            </button>
        </div>
    );
}