type Props = {
  info: { detail: number; label: string; color: string };
};

export default function InfoCard({ info }: Props) {
  return (
    <div className="flex flex-col items-center p-2 sm:p-4 border border-agl-border w-full bg-agl-background-darker-gray rounded-xl">
      <p className={`text-${info.color} text-2xl font-extrabold`}>
        {info.detail}
      </p>
      <p className="text-agl-gray text-[12px] sm:text-[13px]">{info.label}</p>
    </div>
  );
}
