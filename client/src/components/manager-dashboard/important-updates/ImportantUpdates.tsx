import { useQuery } from "@tanstack/react-query";
import type { AnnounceMent } from "../../../types/types";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import UpdateCard from "./UpdateCard";
import { HiSpeakerphone } from "react-icons/hi";

export default function ImportantUpdates() {
  const axiosPrivate = useAxiosPrivate();

  const announcementQuery = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await axiosPrivate.get<{ announcements: AnnounceMent[] }>(
        "/announcements",
      );
      return res.data.announcements;
    },
  });

  const announcements = announcementQuery.data ?? [];

  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-2xl border border-agl-border-light bg-agl-background-darker-gray p-3 text-agl-white sm:gap-4 sm:p-5">
      <div className="flex items-center gap-2 font-bebas-neue text-2xl sm:text-[25px]">
        <HiSpeakerphone
          size={20}
          className="shrink-0 text-agl-danger"
          aria-hidden="true"
        />
        <h2 className="min-w-0">IMPORTANT UPDATES</h2>
      </div>

      {/**Announcements */}
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        {announcementQuery.isPending ? (
          <p className="text-sm text-agl-gray">Loading announcements...</p>
        ) : announcementQuery.isError ? (
          <p className="text-sm text-agl-danger">
            Could not load announcements.
          </p>
        ) : announcements.length === 0 ? (
          <h2>No Announcements</h2>
        ) : (
          announcements.map((announcement) => (
            <UpdateCard key={announcement._id} announcement={announcement} />
          ))
        )}
      </div>
    </section>
  );
}
