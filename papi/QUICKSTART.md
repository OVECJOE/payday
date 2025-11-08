# Payday - Quick Start Guide

Get your Payday API running in 5 minutes!

## Step 1: Start Infrastructure

```bash
# Start PostgreSQL and Redis using Docker
docker-compose up -d

# Verify services are running
docker-compose ps
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env
```

**Update these critical values in `.env`:**

```bash
# Generate secure JWT secrets (min 32 chars each)
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long
JWT_REFRESH_SECRET=your_refresh_token_secret_also_32_chars_minimum

# Generate encryption key (exactly 32 chars)
ENCRYPTION_KEY=your_32_character_encryption_k

# Get from Paystack Dashboard (test keys for development)
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

## Step 4: Start Development Server

```bash
npm run start:dev
```

The API will start on `http://localhost:3000/api`

## Step 5: Test the API

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "08012345678",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "timezone": "Africa/Lagos"
  }'
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Add a Recipient

```bash
# Save your access token
TOKEN="your_access_token_from_registration"

curl -X POST http://localhost:3000/api/recipients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "accountNumber": "0123456789",
    "bankCode": "058"
  }'
```

### Create a Recurring Schedule

```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "recipient_uuid_from_previous_step",
    "amount": 5000,
    "frequency": "weekly",
    "startDate": "2024-01-01T09:00:00Z",
    "hour": 9,
    "minute": 0,
    "dayOfWeek": 1,
    "description": "Weekly allowance"
  }'
```

### Check Your Wallet Balance

```bash
curl -X GET http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer $TOKEN"
```

## Understanding Payment Frequencies

### Daily

Runs every day at specified time:

```json
{
  "frequency": "daily",
  "hour": 9,
  "minute": 0
}
```

### Weekly

Runs on specific day of week:

```json
{
  "frequency": "weekly",
  "dayOfWeek": 1,
  "hour": 9,
  "minute": 0
}
```

`dayOfWeek`: 0=Sunday, 1=Monday, ..., 6=Saturday

### Monthly

Runs on specific day of month:

```json
{
  "frequency": "monthly",
  "dayOfMonth": 1,
  "hour": 9,
  "minute": 0
}
```

If day doesn't exist (e.g., Feb 31), uses last day of month.

### Custom

Runs every N days:

```json
{
  "frequency": "custom",
  "customIntervalDays": 14,
  "hour": 9,
  "minute": 0
}
```

## Timezone Examples

### For Users in Nigeria

```json
{
  "timezone": "Africa/Lagos"
}
```

### For Diaspora Users

```json
{
  "timezone": "America/New_York"
}
```

Schedule times are converted correctly regardless of user location!

## Testing Payment Flow

1. **Fund your Paystack test account** (sandbox mode)
2. **Create a schedule** (as shown above)
3. **Wait for next run** or manually trigger via schedule check queue
4. **Monitor logs** for payment processing
5. **Check transaction history**:

```bash
curl -X GET http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN"
```

## Monitoring Queues

Access BullMQ dashboard (optional):

```bash
npm install -g bull-board
bull-board
```

## Common Issues

### "Wallet not found"

- Wallet is auto-created on registration
- If missing, check database connection

### "Insufficient balance"

- Fund your test Paystack account
- Or mock the payment provider for testing

### "Invalid bank account"

- Use Paystack's test account numbers
- Example: `0123456789` with bank code `058`

### Schedule not running

- Check Redis connection
- Verify BullMQ queue is processing
- Check system time matches Nigeria timezone

## Next Steps

1. **Read full README.md** for production deployment
2. **Setup Paystack webhooks** for real-time updates
3. **Implement notification system** (SMS/Email)
4. **Add 2FA** for enhanced security
5. **Setup monitoring** (Sentry, Datadog)

## Useful Commands

```bash
# View logs
npm run start:dev

# Run tests
npm run test

# Check database migrations
npm run typeorm migration:show

# Generate new migration
npm run typeorm migration:generate -- -n MigrationName

# Clear Redis cache
redis-cli FLUSHALL
```

## Getting Help

- Check logs in terminal
- Review `README.md` for detailed documentation
- Inspect database: `psql -U payday -d payday_db`
- Monitor Redis: `redis-cli MONITOR`

---

Happy coding! 🚀
