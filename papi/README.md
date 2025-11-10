# Payday - Automated Recurring Payment Platform

A production-grade fintech API for automating recurring payments to multiple recipients with different schedules, built specifically for the Nigerian market.

## Features

- ✅ **Automated Recurring Payments** - Daily, weekly, monthly, or custom intervals
- ✅ **Multiple Recipients** - Send to unlimited beneficiaries simultaneously
- ✅ **Timezone Intelligence** - Perfect handling for Nigeria timezone and diaspora users
- ✅ **Bank Account Validation** - Real-time verification via Paystack/Flutterwave
- ✅ **Wallet System** - Built-in balance management with transaction locking
- ✅ **Payment Orchestration** - Automatic failover between providers
- ✅ **Idempotent Operations** - No duplicate payments, ever
- ✅ **Webhook Processing** - Real-time payment status updates
- ✅ **Comprehensive Audit Trails** - Every action logged immutably
- ✅ **Rate Limiting** - DDoS protection built-in
- ✅ **JWT Authentication** - Secure token-based auth with refresh tokens

## Tech Stack

- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL (ACID-compliant transactions)
- **Cache/Queue**: Redis + BullMQ
- **Payment Providers**: Paystack (primary), Flutterwave (backup)
- **Security**: bcrypt, Helmet, AES-256-GCM encryption

## Prerequisites

- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+
- Paystack account (test/live keys)

## Installation

1. **Clone and install dependencies**

    ```bash
    npm install
    ```

2. **Setup environment variables**

    ```bash
    cp .env.example .env
    ```

    Edit `.env` with your credentials:

    - Database credentials
    - Redis connection
    - JWT secrets (minimum 32 characters)
    - Paystack API keys
    - Encryption key (32 characters)

3. **Setup database**

    ```bash
    # Create PostgreSQL database
    createdb payday_db

    # Run migrations (auto-sync enabled in development)
    npm run start:dev
    ```

4. **Start Redis**

```bash
redis-server
```

## Running the Application

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

API will be available at: `http://localhost:3000/api`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password

### Recipients

- `POST /api/recipients` - Add new recipient (validates bank account)
- `GET /api/recipients` - Get all recipients
- `GET /api/recipients/:id` - Get recipient details
- `PUT /api/recipients/:id` - Update recipient
- `DELETE /api/recipients/:id` - Delete recipient
- `POST /api/recipients/validate-account` - Validate bank account
- `GET /api/recipients/banks/list` - Get all Nigerian banks

### Schedules

- `POST /api/schedules` - Create recurring payment schedule
- `GET /api/schedules` - Get all schedules
- `GET /api/schedules/:id` - Get schedule details
- `PUT /api/schedules/:id` - Update schedule
- `POST /api/schedules/:id/pause` - Pause schedule
- `POST /api/schedules/:id/resume` - Resume schedule
- `POST /api/schedules/:id/cancel` - Cancel schedule
- `GET /api/schedules/stats` - Get schedule statistics

### Wallet

- `GET /api/wallet` - Get wallet details
- `GET /api/wallet/balance` - Get current balance

### Transactions

- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/:id` - Get transaction details

### Webhooks (Public endpoints)

- `POST /api/webhooks/paystack` - Paystack webhook handler
- `POST /api/webhooks/flutterwave` - Flutterwave webhook handler

## Payment Flow

1. **User creates schedule** → Validated and stored
2. **BullMQ checks every minute** → Identifies due payments
3. **Payment queued** → Idempotency key generated
4. **Wallet locked** → Prevents overdraft
5. **Payment initiated** → Via Paystack (failover to Flutterwave if needed)
6. **Webhook received** → Payment status updated
7. **Wallet debited** → Funds released from lock
8. **Next run calculated** → Using timezone-aware logic

## Timezone Handling

All schedules respect user timezones:

- Default: `Africa/Lagos` (WAT - UTC+1)
- Diaspora support: Any IANA timezone
- Business day calculations
- DST-aware (when applicable)

## Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Tokens**: Access (15min) + Refresh (7 days)
- **Data Encryption**: AES-256-GCM for sensitive data
- **Webhook Verification**: HMAC signature validation
- **Rate Limiting**: 100 requests/minute per user
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Helmet middleware

## Transaction Safety

- **Pessimistic Locking**: Prevents race conditions on wallet operations
- **Idempotency Keys**: No duplicate payments on retry
- **Atomic Operations**: Database transactions ensure consistency
- **Audit Logs**: Immutable record of all financial operations
- **Retry Logic**: 3 attempts with exponential backoff

## Queue System

### Payment Queue

- Processes scheduled payments
- Automatic retries on failure
- Dead letter queue for permanent failures

### Schedule Check Queue

- Runs every minute (cron: `* * * * *`)
- Identifies due payments
- Queues them for processing

## Monitoring

The system includes:

- Structured logging via Winston
- Error tracking (integrate Sentry)
- Queue health monitoring
- Payment provider health checks
- Circuit breaker for failing providers

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Deployment Checklist

- [ ] Set strong JWT secrets (min 32 chars)
- [ ] Use production Paystack keys
- [ ] Enable PostgreSQL SSL
- [ ] Setup Redis password
- [ ] Configure CORS origins
- [ ] Enable rate limiting
- [ ] Setup monitoring (Datadog/New Relic)
- [ ] Configure webhook URLs on Paystack dashboard
- [ ] Setup automated backups (PostgreSQL)
- [ ] Enable application logging
- [ ] Setup CI/CD pipeline
- [ ] Configure firewall rules
- [ ] SSL certificate for API

## Production Environment Variables

```bash
NODE_ENV=production
DATABASE_SSL=true
CORS_ORIGIN=https://yourapp.com
SENTRY_DSN=your_sentry_dsn
```

## Webhook Configuration

On Paystack Dashboard, configure webhook URL:

```txt
https://api.yourapp.com/api/webhooks/paystack
```

Events to subscribe:

- `charge.success` - For wallet funding transactions
- `transfer.success` - For outgoing payment transfers
- `transfer.failed` - For failed payment transfers
- `transfer.reversed` - For reversed payment transfers

## Rate Limits

- Free tier: 10 transactions/month
- Thereafter: ₦20-50 per transaction or 0.5-1% (capped)

## Support

For issues or questions:

- Email: <support@payday.com>
- Documentation: <https://docs.payday.com>

## License

Proprietary - All rights reserved

---

Built with ❤️ for Nigeria
