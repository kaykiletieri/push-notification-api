import { MigrationInterface, QueryRunner } from "typeorm";

export class ClientsDeleteOnCascate1735139458046 implements MigrationInterface {
    name = 'ClientsDeleteOnCascate1735139458046'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_scopes" DROP CONSTRAINT "FK_ac1f257edd6990358b10648ba06"`);
        await queryRunner.query(`ALTER TABLE "client_scopes" ADD CONSTRAINT "FK_ac1f257edd6990358b10648ba06" FOREIGN KEY ("scope_id") REFERENCES "scopes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_scopes" DROP CONSTRAINT "FK_ac1f257edd6990358b10648ba06"`);
        await queryRunner.query(`ALTER TABLE "client_scopes" ADD CONSTRAINT "FK_ac1f257edd6990358b10648ba06" FOREIGN KEY ("scope_id") REFERENCES "scopes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
