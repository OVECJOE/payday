import { MigrationInterface, QueryRunner } from "typeorm";

export class OptionalTransactionScheduleIdFix1762730822319 implements MigrationInterface {
    name = 'OptionalTransactionScheduleIdFix1762730822319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_acd858acbb50ff6746235c68a91"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_027bc0e7f0e511822fd3019859f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_534bc3b2570fab616d0e7a2a1a"`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "scheduleId" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_534bc3b2570fab616d0e7a2a1a" ON "transactions" ("scheduleId", "status") `);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_acd858acbb50ff6746235c68a91" FOREIGN KEY ("scheduleId") REFERENCES "recurring_schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_027bc0e7f0e511822fd3019859f" FOREIGN KEY ("recipientId") REFERENCES "recipients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_027bc0e7f0e511822fd3019859f"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_acd858acbb50ff6746235c68a91"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_534bc3b2570fab616d0e7a2a1a"`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "scheduleId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_534bc3b2570fab616d0e7a2a1a" ON "transactions" ("scheduleId", "status") `);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_027bc0e7f0e511822fd3019859f" FOREIGN KEY ("recipientId") REFERENCES "recipients"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_acd858acbb50ff6746235c68a91" FOREIGN KEY ("scheduleId") REFERENCES "recurring_schedules"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
