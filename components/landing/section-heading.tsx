/* Shared eyebrow + title + subtitle block used by the landing sections. */

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-14 flex flex-col items-center text-center">
      <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted">
        {eyebrow}
      </span>
      <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="mt-3 max-w-xl text-pretty text-lg text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
