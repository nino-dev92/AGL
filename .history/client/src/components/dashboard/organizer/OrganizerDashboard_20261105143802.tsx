import { useState } from "react";
import { LuClipboardCheck, LuMegaphone, LuTrophy } from "react-icons/lu";
import { TabBar } from "../ui";
import TournamentsPanel from "./TournamentsPanel";
import RegistrationsPanel from "./RegistrationsPanel";
import AnnouncementsPanel from "./AnnouncementsPanel";

type Tab = "tournaments" | "registrations" | "announcements";

const tabs = [
    { id: "tournaments" as const, label: "Tournaments", icon: LuTrophy },
    { id: "registrations" as const, label: "Registrations", icon: LuClipboardCheck },
    { id: "announcements" as const, label: "Announcements", icon: LuMegaphone },
];

export default function OrganizerDashboard() {
    const [tab, setTab] = useState<Tab>("tournaments");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-agl-white">
                        Organizer Console
                    </h2>
                    <p className="text-sm text-agl-gray">
                        Create tournaments, review registrations, record results, and broadcast updates.
                    </p>
                </div>
                <TabBar tabs={tabs} value={tab} onChange={setTab} />
            </div>

            {tab === "tournaments" && <TournamentsPanel />}
            {tab === "registrations" && <RegistrationsPanel />}
            {tab === "announcements" && <AnnouncementsPanel />}
        </div>
    );
}