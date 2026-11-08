import type { Tournament, Match } from "../../../types/types";
import { SmallCards, LargeCards } from "../cards/InfoCards";
import { LuDollarSign } from "react-icons/lu";
import { FaPeopleGroup } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { CiCalendarDate } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import { VscGitBranchCompact } from "react-icons/vsc";
import { SlCalender } from "react-icons/sl";
type Props = {
  tournament: Tournament;
  matches: Match[];
};

export default function CardSection({ tournament, matches }: Props) {
  const formatTournamentDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

  const smallCardInfo = [
    {
      id: 1,
      logo: <LuDollarSign size={18} className="text-agl-yellow" />,
      label: "PROZE POOL",
      value: tournament.prizePool.toLocaleString(),
      currency: tournament.currency,
    },
    {
      id: 2,
      logo: <FaPeopleGroup size={20} />,
      label: "TEAMS",
      value:
        tournament.registeredTeams.length.toString() +
        `${tournament.registeredTeams.length > 1 ? " Teams" : " Team"}`,
    },
    {
      id: 3,
      logo: <IoLocationOutline size={18} className="text-agl-red" />,
      label: "LOCATION",
      value: tournament.region.toUpperCase(),
    },
    {
      id: 4,
      logo: <CiCalendarDate size={18} />,
      label: "DATES",
      value: `${formatTournamentDate(new Date(tournament.startDate))} – ${formatTournamentDate(new Date(tournament.endDate))}`,
    },
  ];

  const largeCardInfo = [
    {
      id: 1,
      logo: <SlCalender />,
      label: "Match Schedule",
      value: `${matches.length} matches : ${matches.filter((match) => match.status === "ongoing").length} live`,
      color: "agl-red",
      nav: `/match-schedule/${tournament._id}`,
    },
    {
      id: 2,
      logo: <VscGitBranchCompact />,
      label: "BRACKETS",
      value: "6 rounds : Click to view teams",
      color: "agl-yellow",
    },
    {
      id: 3,
      logo: <FaStar />,
      label: "Highlights & MVP",
      value: "3 top players",
      color: "agl-white",
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-agl-white mt-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {smallCardInfo.map((item) => (
          <SmallCards key={item.id} info={item} />
        ))}
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {largeCardInfo.map((item) => (
          <LargeCards key={item.id} info={item} />
        ))}
      </div>
    </div>
  );
}
