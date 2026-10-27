export default function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold tracking-[0.3em] text-agl-lime">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl uppercase text-agl-white md:text-section">
        {title}
      </h2>
    </div>
  );
}
