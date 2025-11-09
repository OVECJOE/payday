import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
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
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
