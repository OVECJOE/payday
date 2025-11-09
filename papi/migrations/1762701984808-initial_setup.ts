import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1762701984808 implements MigrationInterface {
  name = 'InitialSetup1762701984808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."recipients_type_enum" AS ENUM('individual', 'business')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."recipients_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "recipients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "name" character varying NOT NULL, "accountNumber" character varying NOT NULL, "bankCode" character varying NOT NULL, "bankName" character varying NOT NULL, "type" "public"."recipients_type_enum" NOT NULL DEFAULT 'individual', "verified" boolean NOT NULL DEFAULT false, "verifiedAt" TIMESTAMP, "status" "public"."recipients_status_enum" NOT NULL DEFAULT 'active', "email" character varying, "phone" character varying, "notes" text, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_de8fc5a9c364568f294798fe1e9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cae40954864dcba533ddedd39c" ON "recipients" ("userId", "accountNumber", "bankCode") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."recurring_schedules_frequency_enum" AS ENUM('daily', 'weekly', 'monthly', 'custom')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."recurring_schedules_status_enum" AS ENUM('active', 'paused', 'cancelled', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "recurring_schedules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "recipientId" uuid NOT NULL, "amount" numeric(15,2) NOT NULL, "frequency" "public"."recurring_schedules_frequency_enum" NOT NULL, "dayOfWeek" integer, "dayOfMonth" integer, "customIntervalDays" integer, "hour" integer NOT NULL, "minute" integer NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP, "nextRunDate" TIMESTAMP NOT NULL, "lastRunDate" TIMESTAMP, "status" "public"."recurring_schedules_status_enum" NOT NULL DEFAULT 'active', "successfulRuns" integer NOT NULL DEFAULT '0', "failedRuns" integer NOT NULL DEFAULT '0', "consecutiveFailures" integer NOT NULL DEFAULT '0', "description" text, "pauseReason" text, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_38d45a0ba9ad357cd3545e1dcba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac7c58d94e6f1b332258d4fcbe" ON "recurring_schedules" ("nextRunDate") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87ceedd995a121bd09bf4d05fd" ON "recurring_schedules" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b0f9934c9f9002e231704b3766" ON "recurring_schedules" ("userId", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9368ed1f73ff2922f06a8a26d6" ON "recurring_schedules" ("status", "nextRunDate") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_kycstatus_enum" AS ENUM('pending', 'verified', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'suspended', 'deactivated')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "phone" character varying NOT NULL, "passwordHash" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "kycStatus" "public"."users_kycstatus_enum" NOT NULL DEFAULT 'pending', "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "timezone" character varying NOT NULL DEFAULT 'Africa/Lagos', "twoFactorSecret" character varying, "twoFactorEnabled" boolean NOT NULL DEFAULT false, "refreshToken" character varying, "lastLoginAt" TIMESTAMP, "lastLoginIp" character varying, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."wallets_currency_enum" AS ENUM('NGN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "balance" numeric(15,2) NOT NULL DEFAULT '0', "lockedBalance" numeric(15,2) NOT NULL DEFAULT '0', "currency" "public"."wallets_currency_enum" NOT NULL DEFAULT 'NGN', "version" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2ecdb33f23e9a6fc392025c0b97" UNIQUE ("userId"), CONSTRAINT "REL_2ecdb33f23e9a6fc392025c0b9" UNIQUE ("userId"), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_type_enum" AS ENUM('scheduled_payment', 'manual_payment', 'wallet_funding', 'refund')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_status_enum" AS ENUM('pending', 'processing', 'success', 'failed', 'reversed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_provider_enum" AS ENUM('paystack', 'flutterwave', 'manual')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "idempotencyKey" character varying NOT NULL, "userId" uuid NOT NULL, "scheduleId" uuid NOT NULL, "recipientId" uuid, "amount" numeric(15,2) NOT NULL, "fee" numeric(15,2) NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "status" "public"."transactions_status_enum" NOT NULL, "provider" "public"."transactions_provider_enum" NOT NULL, "providerReference" character varying, "failureReason" text, "retryCount" integer NOT NULL DEFAULT '0', "completedAt" TIMESTAMP, "description" text, "providerResponse" jsonb, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_86238dd0ae2d79be941104a5842" UNIQUE ("idempotencyKey"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_da87c55b3bbbe96c6ed88ea7ee" ON "transactions" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e744417ceb0b530285c08f3865" ON "transactions" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_86238dd0ae2d79be941104a584" ON "transactions" ("idempotencyKey") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8db60bef71999bd9a0617db618" ON "transactions" ("providerReference") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_534bc3b2570fab616d0e7a2a1a" ON "transactions" ("scheduleId", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4507aa90de3160c96436491562" ON "transactions" ("userId", "status", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('create', 'update', 'delete', 'login', 'logout', 'password_change', 'payment_initiated', 'payment_completed', 'schedule_created', 'schedule_paused', 'schedule_resumed', 'schedule_cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_resourcetype_enum" AS ENUM('user', 'recipient', 'schedule', 'transaction', 'wallet')`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "action" "public"."audit_logs_action_enum" NOT NULL, "resourceType" "public"."audit_logs_resourcetype_enum" NOT NULL, "resourceId" uuid, "description" text, "ipAddress" text, "userAgent" text, "changes" jsonb, "metadata" jsonb, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cfa83f61e4d27a87fcae1e025a" ON "audit_logs" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88dcc148d532384790ab874c3d" ON "audit_logs" ("timestamp") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_17b613a55b287678b6f26ab8b2" ON "audit_logs" ("action", "timestamp") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8e229d453b21312155c6ab8cfd" ON "audit_logs" ("resourceType", "resourceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_65bf0f1c91acea1b3dcf5b98f1" ON "audit_logs" ("userId", "timestamp") `,
    );
    await queryRunner.query(
      `ALTER TABLE "recipients" ADD CONSTRAINT "FK_7b58601301bacb8e4f20d2800b0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_schedules" ADD CONSTRAINT "FK_38d50fdbf3cfe9e918a0c674617" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_schedules" ADD CONSTRAINT "FK_f202980a0979bb2c2e71b1c5a99" FOREIGN KEY ("recipientId") REFERENCES "recipients"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_acd858acbb50ff6746235c68a91" FOREIGN KEY ("scheduleId") REFERENCES "recurring_schedules"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_027bc0e7f0e511822fd3019859f" FOREIGN KEY ("recipientId") REFERENCES "recipients"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_027bc0e7f0e511822fd3019859f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_acd858acbb50ff6746235c68a91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_schedules" DROP CONSTRAINT "FK_f202980a0979bb2c2e71b1c5a99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_schedules" DROP CONSTRAINT "FK_38d50fdbf3cfe9e918a0c674617"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipients" DROP CONSTRAINT "FK_7b58601301bacb8e4f20d2800b0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_65bf0f1c91acea1b3dcf5b98f1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8e229d453b21312155c6ab8cfd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_17b613a55b287678b6f26ab8b2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_88dcc148d532384790ab874c3d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cfa83f61e4d27a87fcae1e025a"`,
    );
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(
      `DROP TYPE "public"."audit_logs_resourcetype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4507aa90de3160c96436491562"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_534bc3b2570fab616d0e7a2a1a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8db60bef71999bd9a0617db618"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_86238dd0ae2d79be941104a584"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e744417ceb0b530285c08f3865"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_da87c55b3bbbe96c6ed88ea7ee"`,
    );
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_provider_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    await queryRunner.query(`DROP TABLE "wallets"`);
    await queryRunner.query(`DROP TYPE "public"."wallets_currency_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_kycstatus_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9368ed1f73ff2922f06a8a26d6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b0f9934c9f9002e231704b3766"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_87ceedd995a121bd09bf4d05fd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac7c58d94e6f1b332258d4fcbe"`,
    );
    await queryRunner.query(`DROP TABLE "recurring_schedules"`);
    await queryRunner.query(
      `DROP TYPE "public"."recurring_schedules_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."recurring_schedules_frequency_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cae40954864dcba533ddedd39c"`,
    );
    await queryRunner.query(`DROP TABLE "recipients"`);
    await queryRunner.query(`DROP TYPE "public"."recipients_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."recipients_type_enum"`);
  }
}
