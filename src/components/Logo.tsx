export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 64 64" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#d62828" />
        <g transform="rotate(-35 32 32)">
          <path d="M24 13h16l-4 22h-8z" fill="#fff" />
          <path d="M28 13v22M32 13v22M36 13v22" stroke="#d62828" strokeWidth="1.5" />
          <circle cx="32" cy="41" r="7" fill="#0b0b0c" />
        </g>
      </svg>
      <span className="font-display leading-none uppercase text-white">
        <span className="block text-[11px] tracking-[0.3em] text-zinc-400">Brisbane</span>
        <span className="block text-lg font-bold tracking-wider">Badminton</span>
      </span>
    </span>
  );
}
