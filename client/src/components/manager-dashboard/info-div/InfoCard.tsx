type Props = {
  info: {
    id: string;
    title: string;
    value: number | string;
    extraDetails: string;
    icon: React.ReactNode;
    color: string;
  };
};

export default function InfoCard({ info }: Props) {
  return (
    <div className="flex h-full justify-between bg-agl-background-light text-agl-white p-2 sm:p-4 border border-agl-border-light rounded-2xl w-full">
      <div>
        <h2 className="text-[11px] sm:text-[12px] text-agl-gray font-bold">
          {info.title}
        </h2>
        <p className={`text-[20px] sm:text-[25px] text-${info.color}`}>
          {info.value}
        </p>
        <p className="text-[12px] text-agl-gray">{info.extraDetails}</p>
      </div>
      <div className="flex">
        <div
          className="flex items-center justify-center h-7 sm:h-9 aspect-square rounded-lg"
          style={{
            backgroundColor: `color-mix(in srgb, var(--color-${info.color}) 40%, transparent)`,
          }}
        >
          {info.icon}
        </div>
      </div>
    </div>
  );
}
