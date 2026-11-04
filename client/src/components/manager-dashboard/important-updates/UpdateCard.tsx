import type { AnnounceMent } from "../../../types/types";
import { HiSpeakerphone } from "react-icons/hi";
import { formatDate } from "../../../utils/formateDate";

type Props = {
  announcement: AnnounceMent;
};

export default function UpdateCard({ announcement }: Props) {
  return (
    <article className="flex min-h-26 min-w-0 gap-3 rounded-2xl border border-agl-border-light bg-agl-background-dark-gray p-3 sm:gap-4 sm:p-4">
      {/**Icon */}
      <div className="shrink-0 pt-1">
        <HiSpeakerphone className="text-agl-gray" aria-hidden="true" />
      </div>

      {/**Details */}
      <div className="flex min-w-0 grow flex-col gap-2">
        {/**Date and button */}
        <div className="flex flex-wrap justify-between gap-x-2 gap-y-1 text-xs">
          <span
            className={`${announcement.type === "general" ? "bg-blue-800/50 border-blue-500 text-blue-400" : announcement.type === "tournament" ? "bg-green-800/50 border-green-500 text-green-400" : announcement.type === "match" ? "bg-yellow-800/50 border-agl-yellow text-agl-yellow" : "bg-red-800/50 border-red-500 text-red-400"} whitespace-nowrap rounded-2xl border px-2 py-0.5`}
          >
            {announcement.type.charAt(0).toUpperCase() +
              announcement.type.slice(1)}
          </span>
          <span className="text-agl-gray">
            {formatDate(new Date(announcement.createdAt))}
            {"  "}
            {new Date(announcement.createdAt).toLocaleTimeString().slice(0, 5) +
              new Date(announcement.createdAt).toLocaleTimeString().slice(8)}
          </span>
        </div>

        {/**Details */}
        <div className="min-w-0">
          <h3 className="wrap-break-word text-base sm:text-lg">
            {announcement.title}
          </h3>
          <p className="wrap-break-word text-[13px] sm:text-sm leading-relaxed text-agl-gray">
            {announcement.content}
          </p>
        </div>
      </div>
    </article>
  );
}
