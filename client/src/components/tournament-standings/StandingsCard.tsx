import type { TournamentStanding } from "../../types/types";

type Props = {
  standing: TournamentStanding;
  rank: number;
};

export default function StandingsCard({ standing, rank }: Props) {
  const winRate =
    standing.mw + standing.ml > 0
      ? `${Math.round((standing.mw / (standing.mw + standing.ml)) * 100)}%`
      : "0%";
  const details = [
    {
      id: 1,
      label: "PLAYED",
      value: standing.mp,
      colorClass: "text-agl-white",
    },
    {
      id: 2,
      label: "WINS",
      value: standing.mw,
      colorClass: "text-agl-success",
    },
    { id: 3, label: "LOSSES", value: standing.ml, colorClass: "text-agl-red" },
    { id: 4, label: "WIN RATE", value: winRate, colorClass: "text-agl-white" },
    {
      id: 5,
      label: "POINTS",
      value: standing.points,
      colorClass: "text-agl-yellow",
    },
  ];

  return (
    <section className="">
      <div className="flex justify-between text-agl-white p-4 border border-agl-border-light hover:border-agl-yellow/50 bg-agl-background-darker-gray rounded-xl transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(235,41,41,0.35)]">
        {/**Left side */}
        <div className="flex items-center gap-4">
          <div className="bg-agl-yellow w-8 h-8 flex justify-center items-center rounded-full">
            <p className="font-extrabold text-[14px] text-black">{rank}</p>
          </div>

          {/**Image*/}
          {standing.team.logo?.url ? (
            <div
              style={{ backgroundImage: `url("${standing.team.logo.url}")` }}
              className="w-10 h-10 bg-cover bg-center rounded-xl"
              role="img"
              aria-label={`${standing.team.name} logo`}
            />
          ) : (
            <div className="flex w-10 h-10 items-center justify-center rounded-full bg-agl-gray/20 font-bold text-agl-gray">
              {standing.team.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/**Details*/}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold">{standing.team.name}</h3>
            <p className="text-agl-gray text-[12px]">{standing.team.slug}</p>
          </div>
        </div>

        {/**Right side */}
        <div className="flex gap-6">
          {details.map((detail) => (
            <div
              key={detail.id}
              className="flex flex-col gap justify-center items-center"
            >
              <h3 className={`${detail.colorClass} font-bold`}>
                {detail.value}
              </h3>
              <p className="text-agl-gray/50 text-[10px]">{detail.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
