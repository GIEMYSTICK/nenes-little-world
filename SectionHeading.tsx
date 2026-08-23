export function SectionHeading({ kicker, title, copy, align = "center" }: { kicker: string; title: string; copy?: string; align?: "center" | "left" }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <p className="eyebrow">{kicker}</p>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}
