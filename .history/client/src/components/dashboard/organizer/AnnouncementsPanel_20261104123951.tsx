import { useState } from "react";
import { LuMegaphone, LuPlus } from "react-icons/lu";
import { useDashboard } from "../store";
import type { AnnouncementDraft, AnnouncementPriority } from "../model";
import {
    DeleteButton,
    EmptyState,
    Modal,
    PriorityBadge,
    btnGhost,
    btnPrimary,
    card,
    cardHover,
    input,
    label,
} from "../ui";

export default function AnnouncementsPanel() {
    const { announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement } =
        useDashboard();
    const [showForm, setShowForm] = useState(false);

    const sorted = [...announcements].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-black uppercase tracking-tight text-agl-white">
                    Broadcast Updates
                </h3>
                <button className={btnPrimary} onClick={() => setShowForm(true)}>
                    <LuPlus size={18} /> New Announcement
                </button>
            </div>

            {sorted.length === 0 ? (
                <div className={card}>
                    <EmptyState
                        icon={LuMegaphone}
                        title="No announcements"
                        description="Post an update to keep players informed."
                    />
                </div>
            ) : (
                <div className="space-y-3">
                    {sorted.map((a) => (
                        <div
                            key={a.id}
                            className={`${card} ${cardHover} p-4 ${a.isActive ? "" : "opacity-60"}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <PriorityBadge priority={a.priority} />
                                        <span className="text-xs text-agl-gray">
                                            {new Date(a.createdAt).toLocaleString()}
                                        </span>
                                        {!a.isActive && (
                                            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-agl-gray">
                                                Archived
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-agl-white">{a.title}</h4>
                                    <p className="mt-1 text-sm text-agl-gray">{a.body}</p>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        onClick={() => toggleAnnouncement(a.id)}
                                        className="rounded-lg px-2 py-1 text-xs font-semibold text-agl-gray transition-colors hover:bg-white/5 hover:text-agl-white"
                                    >
                                        {a.isActive ? "Archive" : "Reactivate"}
                                    </button>
                                    <DeleteButton onConfirm={() => deleteAnnouncement(a.id)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <AnnouncementFormModal
                    onClose={() => setShowForm(false)}
                    onSave={(draft) => {
                        addAnnouncement(draft);
                        setShowForm(false);
                    }}
                />
            )}
        </div>
    );
}

/* ---------- New announcement modal ---------- */
function AnnouncementFormModal({
    onClose,
    onSave,
}: {
    onClose: () => void;
    onSave: (draft: AnnouncementDraft) => void;
}) {
    const [form, setForm] = useState<AnnouncementDraft>({
        title: "",
        body: "",
        priority: "info",
    });

    const submit = () => {
        if (!form.title.trim()) return;
        onSave({ ...form, title: form.title.trim(), body: form.body.trim() });
    };

    return (
        <Modal
            onClose={onClose}
            title="New Announcement"
            subtitle="Broadcast an update to all players"
            footer={
                <>
                    <button className={btnGhost} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={btnPrimary} onClick={submit} disabled={!form.title.trim()}>
                        <LuMegaphone size={16} /> Publish
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className={label}>Title</label>
                    <input
                        className={input}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Server maintenance notice"
                    />
                </div>
                <div>
                    <label className={label}>Priority</label>
                    <select
                        className={input}
                        value={form.priority}
                        onChange={(e) =>
                            setForm({ ...form, priority: e.target.value as AnnouncementPriority })
                        }
                    >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
                <div>
                    <label className={label}>Message</label>
                    <textarea
                        className={`${input} min-h-[100px]`}
                        value={form.body}
                        onChange={(e) => setForm({ ...form, body: e.target.value })}
                        placeholder="Write the announcement details…"
                    />
                </div>
            </div>
        </Modal>
    );
}