export function UbuntuLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="ubuntuG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.52 0.18 240)" />
          <stop offset="100%" stopColor="oklch(0.42 0.16 252)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#ubuntuG)" />
      <circle cx="20" cy="14" r="3.4" fill="oklch(0.78 0.14 82)" />
      <circle cx="13" cy="25" r="3.4" fill="oklch(0.56 0.15 148)" />
      <circle cx="27" cy="25" r="3.4" fill="oklch(0.96 0.01 250)" />
      <path
        d="M20 17.4 L13 21.6 M20 17.4 L27 21.6 M13 28.4 L27 28.4"
        stroke="oklch(0.96 0.01 250 / 0.55)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
