import { useState } from "react";
import { GoGlobe } from "react-icons/go";
import { LuScrollText } from "react-icons/lu";
import { IoIosStats } from "react-icons/io";

type Props = {
  setView: React.Dispatch<React.SetStateAction<string>>;
};

const details = [
  {
    id: 1,
    detail: "Overview",
    icon: <GoGlobe />,
  },
  {
    id: 2,
    detail: "Rules",
    icon: <LuScrollText />,
  },
  {
    id: 3,
    detail: "Standings",
    icon: <IoIosStats />,
  },
];

export default function Toggle({ setView }: Props) {
  const [selected, setSelected] = useState<number>(1);

  return (
    <div className="grid w-full grid-cols-3 text-agl-white">
      {details.map((detail) => (
        <button
          type="button"
          key={detail.id}
          aria-pressed={selected === detail.id}
          className={`flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 border-b-2 px-1 py-3 text-center text-xs transition-colors duration-100 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm ${
            selected === detail.id
              ? "border-agl-yellow text-agl-yellow"
              : "border-agl-border-light text-agl-gray hover:border-agl-yellow hover:text-agl-yellow"
          }`}
          onClick={() => {
            setSelected(detail.id);
            setView(detail.detail);
          }}
        >
          <span className="shrink-0">{detail.icon}</span>
          <span className="truncate">{detail.detail}</span>
        </button>
      ))}
    </div>
  );
}
