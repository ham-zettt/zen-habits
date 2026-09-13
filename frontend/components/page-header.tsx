export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-eyebrow uppercase text-ink-subtle">{eyebrow}</p>
        <h1 className="mt-2 text-display-md text-ink">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-xl text-body text-ink-subtle">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
