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
import OverviewPanel from "./OverviewPanel";
import UsersPanel from "./UsersPanel";
import TeamsPanel from "./TeamsPanel";
import TournamentsAdminPanel from "./TournamentsAdminPanel";
import ResultsAdminPanel from "./ResultsAdminPanel";
import DisputesPanel from "./DisputesPanel";
import OrganizersPanel from "./OrganizersPanel";
import AuditPanel from "./AuditPanel";

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
            {tab === "audit" && <AuditPanel />}
        </div>
    );
}