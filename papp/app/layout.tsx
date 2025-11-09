import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Payday - Automate Recurring Payments',
  description: 'Never forget to send money again. Automate recurring payments to family, employees, and loved ones.',
  keywords: ['payments', 'recurring payments', 'Nigeria', 'fintech', 'automation'],
  authors: [{ name: 'Payday' }],
  openGraph: {
    title: 'Payday - Automate Recurring Payments',
    description: 'Never forget to send money again. Automate recurring payments to family, employees, and loved ones.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
