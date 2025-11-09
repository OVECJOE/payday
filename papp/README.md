# Payday Client

A production-ready Next.js 15 client application for the Payday automated recurring payments platform.

## Features

- **Authentication**: Secure login, registration, and password reset
- **Recipients Management**: Add, edit, and delete payment recipients with bank account validation
- **Schedule Management**: Create and manage recurring payment schedules (daily, weekly, monthly, custom)
- **Transaction History**: View payment transaction history with status tracking
- **Wallet Management**: Monitor wallet balance (total, available, locked)
- **Responsive Design**: Mobile-first, responsive layout that adapts to all screen sizes
- **Server-Side Rendering**: All pages are server-rendered for optimal SEO and performance
- **Server Actions**: Uses Next.js 15 server actions instead of API routes

## Tech Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Shadcn UI**: High-quality component library
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **date-fns**: Date formatting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Payday API server running (see `../papi/README.md`)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
papp/
├── app/                    # Next.js App Router
│   ├── actions/           # Server actions
│   ├── dashboard/          # Dashboard pages
│   ├── login/             # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── recipients/         # Recipients management
│   ├── schedules/          # Schedules management
│   ├── transactions/       # Transactions display
│   ├── wallet/             # Wallet components
│   └── ui/                 # Shadcn UI components
├── lib/                   # Utility functions
│   ├── api.ts             # API client
│   ├── auth.ts             # Authentication utilities
│   ├── format.ts           # Formatting utilities
│   └── types.ts            # TypeScript types
└── public/                 # Static assets
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Base URL for the Payday API (default: `http://localhost:3000/api`)

## Building for Production

```bash
npm run build
npm start
```

## Security

- All authentication tokens are stored in HTTP-only cookies
- Server-side authentication checks on all protected routes
- Input validation using Zod schemas
- CSRF protection via Next.js built-in mechanisms

## License

Private - All rights reserved
