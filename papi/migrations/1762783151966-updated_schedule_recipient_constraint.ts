import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedScheduleRecipientConstraint1762783151966 implements MigrationInterface {
    name = 'UpdatedScheduleRecipientConstraint1762783151966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_acd858acbb50ff6746235c68a91"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_acd858acbb50ff6746235c68a91" FOREIGN KEY ("scheduleId") REFERENCES "recurring_schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_acd858acbb50ff6746235c68a91"`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_acd858acbb50ff6746235c68a91" FOREIGN KEY ("scheduleId") REFERENCES "recurring_schedules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
