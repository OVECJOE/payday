import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptionalTransactionScheduleId1762730142116
  implements MigrationInterface
{
  name = 'OptionalTransactionScheduleId1762730142116';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_acd858acbb50ff6746235c68a91"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_534bc3b2570fab616d0e7a2a1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "scheduleId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_534bc3b2570fab616d0e7a2a1a" ON "transactions" ("scheduleId", "status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_acd858acbb50ff6746235c68a91" FOREIGN KEY ("scheduleId") REFERENCES "recurring_schedules"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_acd858acbb50ff6746235c68a91"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_534bc3b2570fab616d0e7a2a1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "scheduleId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_534bc3b2570fab616d0e7a2a1a" ON "transactions" ("scheduleId", "status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_acd858acbb50ff6746235c68a91" FOREIGN KEY ("scheduleId") REFERENCES "recurring_schedules"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
