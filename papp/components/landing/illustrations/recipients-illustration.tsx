export function RecipientsIllustration() {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="100" cy="100" r="30" className="text-primary" />
        <path d="M60 150 Q100 130 140 150" className="text-primary" />
        <rect x="70" y="180" width="60" height="40" rx="5" className="text-primary" />
        <path d="M100 220 L100 250" className="text-primary" />
        <path d="M80 250 L120 250" className="text-primary" />
        
        <circle cx="200" cy="100" r="30" className="text-primary" />
        <path d="M160 150 Q200 130 240 150" className="text-primary" />
        <rect x="170" y="180" width="60" height="40" rx="5" className="text-primary" />
        <path d="M200 220 L200 250" className="text-primary" />
        <path d="M180 250 L220 250" className="text-primary" />
        
        <path
          d="M50 50 Q150 30 250 50"
          className="text-muted-foreground"
        />
        <path
          d="M120 80 L180 80"
          className="text-primary"
        />
        <circle cx="150" cy="200" r="5" className="text-primary" fill="currentColor" />
        <path
          d="M140 230 Q150 220 160 230"
          className="text-muted-foreground"
        />
      </g>
    </svg>
  );
}

