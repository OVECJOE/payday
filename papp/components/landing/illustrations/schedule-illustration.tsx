export function ScheduleIllustration() {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="50" y="50" width="200" height="200" rx="10" className="text-primary" />
        <path d="M50 100 L250 100" className="text-primary" />
        <circle cx="100" cy="140" r="8" className="text-primary" fill="currentColor" />
        <path d="M120 140 L180 140" className="text-primary" />
        <circle cx="100" cy="180" r="8" className="text-primary" fill="currentColor" />
        <path d="M120 180 L180 180" className="text-primary" />
        <circle cx="100" cy="220" r="8" className="text-primary" fill="currentColor" />
        <path d="M120 220 L180 220" className="text-primary" />
        <path
          d="M200 140 Q220 130 240 140 T280 140"
          className="text-muted-foreground"
        />
        <path
          d="M200 180 Q220 170 240 180 T280 180"
          className="text-muted-foreground"
        />
        <path
          d="M200 220 Q220 210 240 220 T280 220"
          className="text-muted-foreground"
        />
        <path
          d="M80 30 Q100 20 120 30"
          className="text-primary"
        />
      </g>
    </svg>
  );
}

