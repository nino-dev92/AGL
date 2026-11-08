import { useNavigate } from "react-router-dom";

type Props = {
  info: {
    id: number;
    logo: React.JSX.Element;
    label: string;
    value: string;
    color?: string;
    nav?: string;
    currency?: string;
  };
};

export function SmallCards({ info }: Props) {
  return (
    <div className="flex gap-2 sm:gap-3 items-center px-1.5 py-1 sm:px-4 sm:py-3 border border-agl-border-light p-2 rounded-xl bg-agl-background-darker-gray">
      {/**Logo */}
      <div className="text-agl-yellow">
        {info.currency ? info.currency : info.logo}
      </div>
      {/**Details */}
      <div className="text-[12px]">
        <p className="text-agl-gray">{info.label}</p>
        <p className="font-semibold text-[12px] sm:text-[13px]">{info.value}</p>
      </div>
    </div>
  );
}

export function LargeCards({ info }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="group h-20 flex items-center justify-between px-4 py-3 border border-agl-border-light hover:border-agl-yellow/50 p-2 rounded-xl bg-agl-background-darker-gray cursor-pointer transition-all duration-200 hover:shadow-[0_0_24px_rgba(235,41,41,0.35)]"
      onClick={() => {
        if (info.nav) navigate(info.nav);
      }}
    >
      <div className="flex gap-3 items-center">
        {/**Logo */}
        <div
          style={{
            backgroundColor: `color-mix(in srgb, var(--color-${info.color}) 30%, transparent)`,
          }}
          className={`text-${info.color} p-3 rounded-lg`}
        >
          {info.logo}
        </div>
        {/**Details */}
        <div className="text-[12px]">
          <p className="text-agl-white text-[15px] font-semibold ">
            {info.label}
          </p>
          <p className="text-agl-gray text-[12px]">{info.value}</p>
        </div>
      </div>
      <div>
        <p className="group-hover:text-agl-yellow group-hover:translate-x-1 transition-all duration-200">
          {">"}
        </p>
      </div>
    </div>
  );
}
