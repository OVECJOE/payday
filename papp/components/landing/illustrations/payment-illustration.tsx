export function PaymentIllustration() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full illustration-hand-drawn"
    >
      <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M50 200 L150 200 M150 200 L200 150 M200 150 L300 150 M300 150 L350 200 M350 200 L350 300 M350 300 L50 300 M50 300 L50 200"
          className="text-primary"
        />
        <circle cx="100" cy="250" r="15" className="text-primary" fill="currentColor" />
        <circle cx="200" cy="250" r="15" className="text-primary" fill="currentColor" />
        <circle cx="300" cy="250" r="15" className="text-primary" fill="currentColor" />
        <path
          d="M80 100 Q100 80 120 100 T160 100"
          className="text-muted-foreground"
        />
        <path
          d="M240 100 Q260 80 280 100 T320 100"
          className="text-muted-foreground"
        />
        <path
          d="M180 50 Q200 30 220 50"
          className="text-primary"
        />
        <path
          d="M150 180 L170 160 M170 160 L190 180"
          className="text-primary"
        />
        <path
          d="M250 180 L270 160 M270 160 L290 180"
          className="text-primary"
        />
      </g>
    </svg>
  );
}

