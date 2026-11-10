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
import UsersPanel from "./UsersPanel";
import TeamsPanel from "./TeamsPanel";
import TournamentsAdminPanel from "./TournamentsAdminPanel";
import ResultsAdminPanel from "./ResultsAdminPanel";
import DisputesPanel from "./DisputesPanel";
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

function OverviewPanel({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
    const destinations: { id: Tab; label: string }[] = [
        { id: "users", label: "Users" },
        { id: "teams", label: "Teams" },
        { id: "tournaments", label: "Tournaments" },
        { id: "results", label: "Results" },
        { id: "disputes", label: "Disputes" },
        { id: "organizers", label: "Organizers" },
    ];

    return (
        <section className="rounded-xl border border-agl-gray/20 p-6">
            <h3 className="text-lg font-bold text-agl-white">Administration</h3>
            <p className="mt-1 text-sm text-agl-gray">Choose an area to manage.</p>
            <div className="mt-4 flex flex-wrap gap-3">
                {destinations.map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onNavigate(id)}
                        className="rounded-lg border border-agl-gray/20 px-4 py-2 text-sm text-agl-white hover:border-agl-gray/50"
                    >
                        {label}
                    </button>
                ))}
            </div>
        </section>
    );
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