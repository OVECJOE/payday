export function AnalyticsIllustration() {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="50" y="50" width="200" height="200" rx="10" className="text-primary" />
        <path
          d="M70 200 L100 180 L130 160 L160 140 L190 120 L220 100 L250 80"
          className="text-primary"
          fill="none"
        />
        <path
          d="M70 200 L100 190 L130 170 L160 150 L190 130 L220 110 L250 90"
          className="text-muted-foreground"
          fill="none"
        />
        <circle cx="70" cy="200" r="4" className="text-primary" fill="currentColor" />
        <circle cx="100" cy="180" r="4" className="text-primary" fill="currentColor" />
        <circle cx="130" cy="160" r="4" className="text-primary" fill="currentColor" />
        <circle cx="160" cy="140" r="4" className="text-primary" fill="currentColor" />
        <circle cx="190" cy="120" r="4" className="text-primary" fill="currentColor" />
        <circle cx="220" cy="100" r="4" className="text-primary" fill="currentColor" />
        <circle cx="250" cy="80" r="4" className="text-primary" fill="currentColor" />
        <path d="M50 200 L250 200" className="text-muted-foreground" />
        <path d="M50 200 L50 50" className="text-muted-foreground" />
        <path
          d="M120 30 Q150 20 180 30"
          className="text-primary"
        />
      </g>
    </svg>
  );
}

