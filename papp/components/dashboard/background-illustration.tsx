'use client';

import { usePathname } from 'next/navigation';

export function BackgroundIllustration() {
  const pathname = usePathname();
  
  const getIllustration = () => {
    if (pathname.includes('/recipients')) {
      return <RecipientsBackground />;
    }
    if (pathname.includes('/schedules')) {
      return <SchedulesBackground />;
    }
    if (pathname.includes('/transactions')) {
      return <TransactionsBackground />;
    }
    if (pathname.includes('/wallet')) {
      return <WalletBackground />;
    }
    return <DashboardBackground />;
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-[0.08] dark:opacity-[0.12]">
      <div className="absolute inset-0 w-full h-full">
        {getIllustration()}
      </div>
    </div>
  );
}

function DashboardBackground() {
  return (
    <svg
      viewBox="0 0 1200 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M100 200 Q200 150 300 200 T500 200" />
        <path d="M100 300 Q200 250 300 300 T500 300" />
        <path d="M100 400 Q200 350 300 400 T500 400" />
        <circle cx="700" cy="200" r="40" />
        <circle cx="800" cy="300" r="40" />
        <circle cx="900" cy="400" r="40" />
        <path d="M600 500 L800 500 M700 450 L700 550" />
        <path d="M900 500 L1100 500 M1000 450 L1000 550" />
        <path d="M200 600 Q400 550 600 600 T1000 600" />
        <path d="M150 700 Q350 650 550 700 T950 700" />
      </g>
    </svg>
  );
}

function RecipientsBackground() {
  return (
    <svg
      viewBox="0 0 1200 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="200" cy="150" r="30" />
        <path d="M170 200 Q200 180 230 200" />
        <rect x="150" y="220" width="100" height="60" rx="5" />
        
        <circle cx="400" cy="150" r="30" />
        <path d="M370 200 Q400 180 430 200" />
        <rect x="350" y="220" width="100" height="60" rx="5" />
        
        <circle cx="600" cy="150" r="30" />
        <path d="M570 200 Q600 180 630 200" />
        <rect x="550" y="220" width="100" height="60" rx="5" />
        
        <path d="M100 400 L300 400 M200 350 L200 450" />
        <path d="M400 400 L600 400 M500 350 L500 450" />
        <path d="M700 400 L900 400 M800 350 L800 450" />
        
        <path d="M200 500 Q400 450 600 500 T1000 500" />
        <path d="M300 600 Q500 550 700 600 T1100 600" />
      </g>
    </svg>
  );
}

function SchedulesBackground() {
  return (
    <svg
      viewBox="0 0 1200 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="100" y="100" width="200" height="200" rx="10" />
        <path d="M100 150 L300 150" />
        <circle cx="150" cy="200" r="5" />
        <path d="M170 200 L250 200" />
        <circle cx="150" cy="240" r="5" />
        <path d="M170 240 L250 240" />
        
        <rect x="400" y="100" width="200" height="200" rx="10" />
        <path d="M400 150 L600 150" />
        <circle cx="450" cy="200" r="5" />
        <path d="M470 200 L550 200" />
        
        <rect x="700" y="100" width="200" height="200" rx="10" />
        <path d="M700 150 L900 150" />
        
        <path d="M150 400 Q300 350 450 400 T750 400" />
        <path d="M200 500 Q350 450 500 500 T800 500" />
        <path d="M250 600 Q400 550 550 600 T850 600" />
        
        <circle cx="1000" cy="200" r="30" />
        <path d="M1000 230 L1000 300" />
        <path d="M970 260 L1000 230 L1030 260" />
      </g>
    </svg>
  );
}

function TransactionsBackground() {
  return (
    <svg
      viewBox="0 0 1200 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="100" y="100" width="300" height="200" rx="10" />
        <path d="M100 150 L400 150" />
        <path d="M150 200 L350 200" />
        <path d="M150 250 L350 250" />
        <path d="M150 300 L350 300" />
        
        <path d="M500 150 Q600 100 700 150 T900 150" />
        <path d="M500 200 Q600 150 700 200 T900 200" />
        <path d="M500 250 Q600 200 700 250 T900 250" />
        
        <circle cx="1050" cy="150" r="8" />
        <circle cx="1050" cy="200" r="8" />
        <circle cx="1050" cy="250" r="8" />
        
        <path d="M200 400 L400 400 M300 350 L300 450" />
        <path d="M500 400 L700 400 M600 350 L600 450" />
        <path d="M800 400 L1000 400 M900 350 L900 450" />
        
        <path d="M150 500 Q350 450 550 500 T950 500" />
        <path d="M200 600 Q400 550 600 600 T1000 600" />
        <path d="M250 700 Q450 650 650 700 T1050 700" />
      </g>
    </svg>
  );
}

function WalletBackground() {
  return (
    <svg
      viewBox="0 0 1200 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="200" y="150" width="300" height="200" rx="15" />
        <path d="M200 200 L500 200" />
        <path d="M250 250 L450 250" />
        <path d="M250 300 L450 300" />
        <path d="M250 350 L450 350" />
        
        <circle cx="700" cy="200" r="50" />
        <circle cx="700" cy="200" r="30" />
        <circle cx="700" cy="200" r="10" fill="hsl(var(--foreground))" />
        
        <path d="M850 150 L1050 150 M950 100 L950 200" />
        <path d="M850 250 L1050 250" />
        <path d="M850 300 L1050 300" />
        
        <path d="M150 450 Q350 400 550 450 T950 450" />
        <path d="M200 550 Q400 500 600 550 T1000 550" />
        <path d="M250 650 Q450 600 650 650 T1050 650" />
        
        <path d="M100 700 Q300 650 500 700 T900 700" />
      </g>
    </svg>
  );
}
