export function AuthCard({ title, intro, children, footer }: { title: string; intro?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card p-6 sm:p-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        {intro && <p className="mt-2 text-sm text-zinc-400">{intro}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-5 text-center text-sm text-zinc-400">{footer}</div>}
    </div>
  );
}
