import type { Team } from "../../../types/types";

type Props = {
  team: Team;
  selected: boolean;
};
export default function TeamCard({ team, selected }: Props) {
  return (
    <div
      className={`${selected ? "border-agl-red/50 bg-agl-background-dark-gray shadow-md shadow-agl-danger/50" : " bg-agl-background-light border-agl-border-light hover:border-agl-gray"} flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border  p-3 text-agl-white transition-all duration-200 ease md:w-72`}
    >
      <div className="flex min-w-0 flex-col">
        <h3 className="wrap-break-word font-bold">{team.name}</h3>
        <p className="text-xs text-agl-gray sm:text-[14px]">[{team.slug}]</p>
      </div>
      <div className="shrink-0">
        <button
          className={`${team.isActive ? "bg-agl-success" : "bg-agl-red"} text-black rounded-xl border border-agl-border-light bg-agl-background-light px-2 text-[12px]`}
        >
          {team.isActive ? "Active" : "Suspended"}
        </button>
      </div>
    </div>
  );
}
