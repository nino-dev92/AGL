import { useState } from "react";
import {
    LuLayoutGrid,
    LuScale,
    LuScrollText,
    LuSwords,
    LuTrophy,
    LuUserCog,
    LuUsers,
    LuUsersRound,
} from "react-icons/lu";
import { TabBar } from "../ui";
import TeamsPanel from "./TeamsPanel";
import OrganizersPanel from "./OrganizersPanel";

type Tab =
    | "overview"
    | "users"
    | "teams"
    | "tournaments"
    | "results"
    | "disputes"
    | "organizers"
    | "audit";

const tabs = [
    { id: "overview" as const, label: "Overview", icon: LuLayoutGrid },
    { id: "users" as const, label: "Users", icon: LuUsers },
    { id: "teams" as const, label: "Teams", icon: LuUsersRound },
    { id: "tournaments" as const, label: "Tournaments", icon: LuTrophy },
    { id: "results" as const, label: "Results", icon: LuSwords },
    { id: "disputes" as const, label: "Disputes", icon: LuScale },
    { id: "organizers" as const, label: "Organizers", icon: LuUserCog },
    { id: "audit" as const, label: "Audit Log", icon: LuScrollText },
];

function UnavailablePanel({ name }: { name: string }) {
    return (
        <div className="rounded-xl border border-agl-gray/20 p-6 text-sm text-agl-gray">
            {name} panel is unavailable.
        </div>
    );
}

function OverviewPanel({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-agl-gray">Overview panel is unavailable.</p>
            <div className="flex flex-wrap gap-2">
                {tabs.filter(({ id }) => id !== "overview").map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onNavigate(id)}
                        className="rounded-lg border border-agl-gray/20 px-3 py-2 text-sm text-agl-white"
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function UsersPanel() {
    return <UnavailablePanel name="Users" />;
}

function TournamentsAdminPanel() {
    return <UnavailablePanel name="Tournaments" />;
}

function ResultsAdminPanel() {
    return <UnavailablePanel name="Results" />;
}

function DisputesPanel() {
    return <UnavailablePanel name="Disputes" />;
}

export default function AdminDashboard() {
    const [tab, setTab] = useState<Tab>("overview");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-agl-white">
                        Admin Control Center
                    </h2>
                    <p className="text-sm text-agl-gray">
                        Oversee users, teams, tournaments, disputes and organizers.
                    </p>
                </div>
                <TabBar tabs={tabs} value={tab} onChange={setTab} />
            </div>

            {tab === "overview" && <OverviewPanel onNavigate={setTab} />}
            {tab === "users" && <UsersPanel />}
            {tab === "teams" && <TeamsPanel />}
            {tab === "tournaments" && <TournamentsAdminPanel />}
            {tab === "results" && <ResultsAdminPanel />}
            {tab === "disputes" && <DisputesPanel />}
            {tab === "organizers" && <OrganizersPanel />}
            {tab === "audit" && (
                <div className="rounded-xl border border-agl-gray/20 p-6 text-sm text-agl-gray">
                    Audit log is unavailable.
                </div>
            )}
        </div>
    );
}