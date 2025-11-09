import type { Metadata } from "next";
import { Aclonica, Advent_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const aclonica = Aclonica({
  subsets: ["latin", 'latin-ext'],
  weight: ["400"],
  variable: "--font-aclonica",
});

const adventPro = Advent_Pro({
  subsets: ["latin", 'latin-ext'],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-advent-pro",
});

export const metadata: Metadata = {
  title: "Payday - Automated Recurring Payments",
  description: "Set up recurring payment schedules for multiple recipients. Automated payroll system that beats OPay and Kuda.",
  keywords: ["payments", "recurring payments", "payroll", "automated transfers", "fintech"],
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    images: '/icon.svg',
    title: "Payday - Automated Recurring Payments",
    description: "Set up recurring payment schedules for multiple recipients. Automated payroll system that beats OPay and Kuda.",
    url: 'https://payday-black.vercel.app',
    siteName: "Payday - Automated Recurring Payments",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${aclonica.variable} ${adventPro.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
