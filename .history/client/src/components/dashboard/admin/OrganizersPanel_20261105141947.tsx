import { useState } from "react";
import { LuPencil, LuPlus, LuSave, LuUserCog } from "react-icons/lu";
import { useDashboard } from "../store";
import type { Organizer, OrganizerDraft } from "../model";
import {
    ActiveBadge,
    Avatar,
    DeleteButton,
    EmptyState,
    Modal,
    btnGhost,
    btnPrimary,
    btnSmall,
    card,
    cardHover,
    input,
    label,
} from "../ui";

const ROLE_LABELS: Record<string, string> = {
    organizer: "Organizer",
    senior_organizer: "Senior Organizer",
    admin: "Admin",
};

export default function OrganizersPanel() {
    const { organizers, addOrganizer, updateOrganizer, toggleOrganizer, deleteOrganizer } =
        useDashboard();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Organizer | null>(null);

    const openAdd = () => {
        setEditing(null);
        setShowForm(true);
    };
    const openEdit = (o: Organizer) => {
        setEditing(o);
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-black uppercase tracking-tight text-agl-white">
                    Organizer Accounts
                </h3>
                <button className={btnPrimary} onClick={openAdd}>
                    <LuPlus size={18} /> Add Organizer
                </button>
            </div>

            {organizers.length === 0 ? (
                <div className={card}>
                    <EmptyState icon={LuUserCog} title="No organizers" description="Add an organizer to give them access to the Organizer view." />
                </div>
            ) : (
                <div className="space-y-3">
                    {organizers.map((o) => (
                        <div key={o.id} className={`${card} ${cardHover} p-4 ${o.isActive ? "" : "opacity-70"}`}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar name={`${o.firstName} ${o.lastName}`} size={40} />
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-agl-white">
                                                {o.firstName} {o.lastName}
                                            </span>
                                            <ActiveBadge active={o.isActive} />
                                            <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-bold text-agl-yellow">
                                                {ROLE_LABELS[o.role] ?? o.role}
                                            </span>
                                        </div>
                                        <p className="mt-1 truncate text-sm text-agl-gray">{o.email}</p>
                                        <p className="text-xs text-agl-gray-dark">
                                            Added {new Date(o.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        aria-label="Edit organizer"
                                        onClick={() => openEdit(o)}
                                        className="rounded-lg p-2 text-agl-gray transition-colors hover:bg-white/5 hover:text-agl-yellow"
                                    >
                                        <LuPencil size={16} />
                                    </button>
                                    <button className={`${btnGhost} ${btnSmall}`} onClick={() => toggleOrganizer(o.id)}>
                                        {o.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                    <DeleteButton onConfirm={() => deleteOrganizer(o.id)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <OrganizerFormModal
                    organizer={editing}
                    onClose={() => setShowForm(false)}
                    onSave={(draft) => (editing ? updateOrganizer(editing.id, draft) : addOrganizer(draft))}
                />
            )}
        </div>
    );
}

function OrganizerFormModal({
    organizer,
    onClose,
    onSave,
}: {
    organizer: Organizer | null;
    onClose: () => void;
    /** Returns an error message, or null on success. */
    onSave: (draft: OrganizerDraft) => string | null;
}) {
    const [form, setForm] = useState({
        firstName: organizer?.firstName ?? "",
        lastName: organizer?.lastName ?? "",
        email: organizer?.email ?? "",
        password: "",
        role: organizer?.role ?? "organizer",
    });
    const [error, setError] = useState("");

    const set = (key: keyof typeof form, value: string) => {
        setForm((f) => ({ ...f, [key]: value }));
        setError("");
    };

    const passwordRequired = !organizer;
    const valid =
        form.firstName.trim() &&
        form.lastName.trim() &&
        /\S+@\S+\.\S+/.test(form.email) &&
        (!passwordRequired || form.password.length >= 8);

    const submit = () => {
        // The password is checked for the form but never stored in this frontend-only version.
        const result = onSave({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            role: form.role,
        });
        if (result) setError(result);
        else onClose();
    };

    return (
        <Modal
            onClose={onClose}
            title={organizer ? "Edit Organizer" : "Add Organizer"}
            subtitle={organizer ? "Update account details" : "Create an organizer account"}
            footer={
                <>
                    <button className={btnGhost} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={btnPrimary} onClick={submit} disabled={!valid}>
                        <LuSave size={16} /> {organizer ? "Save Changes" : "Add Organizer"}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className={label}>First name</label>
                        <input className={input} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
                    </div>
                    <div>
                        <label className={label}>Last name</label>
                        <input className={input} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className={label}>Email</label>
                    <input
                        type="email"
                        className={input}
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="name@agl.gg"
                    />
                </div>

                <div>
                    <label className={label}>{organizer ? "New password (optional)" : "Password"}</label>
                    <input
                        type="password"
                        className={input}
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        placeholder={organizer ? "Leave blank to keep the current one" : "At least 8 characters"}
                    />
                    <p className="mt-1 text-xs text-agl-gray-dark">
                        Passwords are not saved in this frontend-only version.
                    </p>
                </div>

                <div>
                    <label className={label}>Role</label>
                    <select className={input} value={form.role} onChange={(e) => set("role", e.target.value)}>
                        <option value="organizer">Organizer</option>
                        <option value="senior_organizer">Senior Organizer</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {error && <p className="text-sm text-agl-red">{error}</p>}
            </div>
        </Modal>
    );
}