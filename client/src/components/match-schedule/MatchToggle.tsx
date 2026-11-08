import { CiCalendarDate } from "react-icons/ci";
import { IoMdTime } from "react-icons/io";
import { GiRadarSweep } from "react-icons/gi";

type Props = {
  view: string;
  setView: React.Dispatch<React.SetStateAction<string>>;
  matches: {
    allMatches: number;
    liveMatches: number;
    upComingMatches: number;
    completedMatches: number;
  };
};

export default function MatchToggle({ view, setView, matches }: Props) {
  const details = [
    {
      id: 1,
      info: "All Matches",
      icon: <CiCalendarDate />,
      value: matches.allMatches,
    },
    {
      id: 2,
      info: "Live",
      icon: <GiRadarSweep />,
      value: matches.liveMatches,
    },
    {
      id: 3,
      info: "Upcoming",
      icon: <IoMdTime />,
      value: matches.upComingMatches,
    },
  ];

  return (
    <div className="match-toggle-scrollbar flex w-full items-center overflow-x-auto overflow-y-hidden border-b border-agl-border-light text-agl-gray">
      {details.map((detail) => (
        <button
          type="button"
          key={detail.id}
          aria-pressed={view === detail.info}
          className={`-mb-px flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 py-3 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-agl-yellow sm:px-4 ${
            view === detail.info
              ? "border-agl-red text-agl-white"
              : "border-transparent hover:text-agl-white"
          }`}
          onClick={() => setView(detail.info)}
        >
          <span className="text-lg">{detail.icon}</span>
          <span>{detail.info}</span>
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
              view === detail.info
                ? "bg-agl-red text-agl-white"
                : "bg-agl-gray-dark/20 text-agl-gray"
            }`}
          >
            {detail.value}
          </span>
        </button>
      ))}
    </div>
  );
}
