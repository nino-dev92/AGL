import { useState } from "react";
import {
    LuChevronRight,
    LuLayoutDashboard,
    LuShieldCheck,
    LuUsers,
} from "react-icons/lu";
import { DashboardProvider, useDashboard } from "../components/dashboard/store";
import { TabBar, card } from "../components/dashboard/ui";

type View = "organizer" | "manager" | "admin";

const views = [
    { id: "organizer" as const, label: "Organizer", icon: LuLayoutDashboard },
    { id: "manager" as const, label: "Manager", icon: LuUsers },
    { id: "admin" as const, label: "Admin", icon: LuShieldCheck },
];

const viewLabel: Record<View, string> = {
    organizer: "Organizer",
    manager: "Manager",
    admin: "Admin",
};

export default function Dashboard() {
    return (
        <DashboardProvider>
            <DashboardShell />
        </DashboardProvider>
    );
}

function DashboardShell() {
    const [view, setView] = useState<View>("organizer");

    return (
        <main className="grow bg-agl-black">
            <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-10">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] text-agl-gray">
                        <span>DASHBOARD</span>
                        <LuChevronRight size={14} />
                        <span className="text-agl-white">{viewLabel[view].toUpperCase()}</span>
                    </nav>

                    <TabBar tabs={views} value={view} onChange={setView} />
                </div>

                {/* Step 2 placeholder: the real views arrive in steps 3 to 5 */}
                <ViewPlaceholder view={view} />
            </div>
        </main>
    );
}

/** Temporary. Proves the shared store is connected. Delete in step 3. */
function ViewPlaceholder({ view }: { view: View }) {
    const s = useDashboard();
    const counts = [
        ["Players", s.players.length],
        ["Teams", s.teams.length],
        ["Tournaments", s.tournaments.length],
        ["Registrations", s.registrations.length],
        ["Matches", s.matches.length],
        ["Announcements", s.announcements.length],
        ["Disputes", s.disputes.length],
        ["Organizers", s.organizers.length],
        ["Audit entries", s.auditLog.length],
    ] as const;

    return (
        <div className={`${card} p-6`}>
            <h2 className="text-3xl font-black uppercase tracking-tight text-agl-white">
                {viewLabel[view]} view
            </h2>
            <p className="mt-1 text-sm text-agl-gray">
                This screen is built in a later step. Store check, loaded sample data:
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {counts.map(([name, n]) => (
                    <div key={name} className="rounded-lg border border-white/15 bg-agl-black/40 p-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-agl-gray">{name}</p>
                        <p className="text-2xl font-black text-agl-yellow">{n}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}