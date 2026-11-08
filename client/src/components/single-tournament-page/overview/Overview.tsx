import { Link } from "react-router-dom";
import type { Match, Tournament } from "../../../types/types";
import UpComingMatchesCard from "../cards/UpComingMatchesCard";
import { FaArrowRight } from "react-icons/fa6";

type Props = {
  tournament: Tournament;
  matches: Match[];
};

// const matches = [
//   {
//     id: 1,
//     teamA: {
//       name: "Crimson Hex",
//       logo: "/logo.png",
//     },
//     teamB: {
//       name: "Ash Wolves",
//       logo: "/COD.png",
//     },
//     time: "Nov 22 · 14:00",
//   },
//   {
//     id: 2,
//     teamA: {
//       name: "Neon Syndicate",
//       logo: "/gamebg.jpg",
//     },
//     teamB: {
//       name: "Frost Titans",
//       logo: "/Efootball.svg",
//     },
//     time: "Nov 22 · 14:00",
//   },
//   {
//     id: 3,
//     teamA: {
//       name: "TBD",
//       logo: "/PUBG.svg",
//     },
//     teamB: {
//       name: "TBD",
//       logo: "/stream-1.jpg.svg",
//     },
//     time: "Nov 22 · 14:00",
//   },
// ];

export default function Overview({ tournament, matches }: Props) {
  const UpcomingMatches: Match[] = matches.filter(
    (match) => match.status === "upcoming",
  );

  return (
    <div className="flex flex-col gap-6 text-agl-white">
      {/**About This Tournament */}
      <div className="flex flex-col gap-4 p-3 sm:p-6 border border-agl-border-light bg-agl-background-darker-gray rounded-xl">
        <h3 className="text-lg sm:text-xl font-extrabold">
          About This Tournamanet
        </h3>
        <p className="text-agl-gray text-[14px] sm:text-[15px]">
          {tournament.description}
        </p>
      </div>

      {/**Upcoming Matches */}
      <div className="flex flex-col gap-4 p-3 sm:p-6 border border-agl-border-light bg-agl-background-darker-gray rounded-xl">
        <div className="flex justify-between">
          <h3 className="text-lg sm:text-xl font-extrabold">
            Upcoming matches
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 border-b border-agl-background-darker-gray hover:border-agl-yellow cursor-pointer">
            <Link
              to={`/match-schedule/${tournament._id}`}
              className="text-agl-yellow  items-center text-[13px]"
            >
              {" "}
              View all
            </Link>
            <FaArrowRight className="text-agl-yellow" size={12} />
          </div>
        </div>

        {/**Cards */}
        <div className="flex flex-col gap-2">
          {UpcomingMatches.length > 1 ? (
            UpcomingMatches.map((match) => (
              <UpComingMatchesCard key={match._id} match={match} />
            ))
          ) : (
            <div className="m-6">
              <h2 className="text-center text-agl-white">
                No upcoming matches for this tournament
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
