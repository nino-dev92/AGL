export default function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold tracking-[0.3em] text-agl-gray">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-agl-white md:text-5xl">
        {title}
      </h2>
    </div>
  );
}