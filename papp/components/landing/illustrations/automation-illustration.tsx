export function AutomationIllustration() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full illustration-hand-drawn"
    >
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="200" cy="200" r="80" className="text-primary" />
        <circle cx="200" cy="200" r="60" className="text-primary" />
        <circle cx="200" cy="200" r="40" className="text-primary" />
        <circle cx="200" cy="200" r="8" className="text-primary" fill="currentColor" />
        
        <circle cx="200" cy="100" r="25" className="text-primary" />
        <path d="M200 125 L200 175" className="text-primary" />
        
        <circle cx="300" cy="200" r="25" className="text-primary" />
        <path d="M275 200 L175 200" className="text-primary" />
        
        <circle cx="200" cy="300" r="25" className="text-primary" />
        <path d="M200 275 L200 225" className="text-primary" />
        
        <circle cx="100" cy="200" r="25" className="text-primary" />
        <path d="M125 200 L175 200" className="text-primary" />
        
        <path
          d="M150 150 Q200 100 250 150"
          className="text-muted-foreground"
        />
        <path
          d="M250 250 Q200 300 150 250"
          className="text-muted-foreground"
        />
        <path
          d="M150 250 Q100 200 150 150"
          className="text-muted-foreground"
        />
        <path
          d="M250 150 Q300 200 250 250"
          className="text-muted-foreground"
        />
        
        <path
          d="M50 50 Q200 30 350 50"
          className="text-primary"
        />
      </g>
    </svg>
  );
}

