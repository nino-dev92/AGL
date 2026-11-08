import type { Tournament } from "../../../types/types";
import { LuScrollText } from "react-icons/lu";

type Props = {
  tournament: Tournament;
};

type RuleProps = {
  rule: string;
  index: number;
};

const RuleCard = ({ rule, index }: RuleProps) => {
  return (
    <div className="p-2 sm:p-4 flex items-center gap-4 sm:gap-6 bg-agl-border/50 border border-agl-border-light rounded-xl">
      <div className="flex justify-center items-center h-6 sm:h-8 aspect-square bg-agl-yellow text-black rounded-full">
        <p className="text-sm sm:text-md font-extrabold">{index + 1}</p>
      </div>
      {/**Detail */}
      <p className="text-[13px] sm:text-[14px]">
        {rule.charAt(0).toUpperCase() + rule.slice(1)}
      </p>
    </div>
  );
};

export default function Rules({ tournament }: Props) {
  const rules = tournament.rules ?? [];

  return (
    <div className="text-white flex flex-col gap-4 p-4 sm:p-6 border border-agl-border-light bg-agl-background-darker-gray rounded-xl">
      <div className="flex gap-2">
        <div
          className="bg-agl-red h-fit rounded p-1.5"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-agl-red) 30%, transparent)",
          }}
        >
          <LuScrollText size={18} className="text-agl-red" />
        </div>

        <div className="flex flex-col">
          <h3 className="text-md sm:text-xl font-bold">Tournament Rules</h3>
          <p className="text-[12px] text-agl-gray">
            All participants must adhere to the following rules
          </p>
        </div>
      </div>

      {/**Cards Div */}
      {rules.length > 1 ? (
        rules.map((rule, index) => (
          <div key={index}>
            <RuleCard rule={rule} index={index} />
          </div>
        ))
      ) : (
        <div className="m-6">
          {" "}
          <h2 className="text-center text-agl-white">
            No rules available for this tournament
          </h2>
        </div>
      )}
    </div>
  );
}
