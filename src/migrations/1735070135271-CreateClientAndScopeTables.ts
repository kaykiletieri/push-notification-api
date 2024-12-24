import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientAndScopeTables1735070135271
  implements MigrationInterface
{
  name = 'CreateClientAndScopeTables1735070135271';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "clients" ("id" uuid NOT NULL, "client_id" character varying NOT NULL, "client_secret" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_49e91f1e368e3f760789e7764aa" UNIQUE ("client_id"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "scopes" ("id" uuid NOT NULL, "name" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1029065e5c13f582d843d73dee5" UNIQUE ("name"), CONSTRAINT "PK_fb1f703d1ac574fe4551a354977" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "client_scopes" ("client_id" uuid NOT NULL, "scope_id" uuid NOT NULL, CONSTRAINT "PK_29de6b0268abc87d538ab3494e6" PRIMARY KEY ("client_id", "scope_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9dd4ad8caa05210d906d9cf909" ON "client_scopes" ("client_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac1f257edd6990358b10648ba0" ON "client_scopes" ("scope_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "client_scopes" ADD CONSTRAINT "FK_9dd4ad8caa05210d906d9cf9091" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "client_scopes" ADD CONSTRAINT "FK_ac1f257edd6990358b10648ba06" FOREIGN KEY ("scope_id") REFERENCES "scopes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "client_scopes" DROP CONSTRAINT "FK_ac1f257edd6990358b10648ba06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "client_scopes" DROP CONSTRAINT "FK_9dd4ad8caa05210d906d9cf9091"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac1f257edd6990358b10648ba0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9dd4ad8caa05210d906d9cf909"`,
    );
    await queryRunner.query(`DROP TABLE "client_scopes"`);
    await queryRunner.query(`DROP TABLE "scopes"`);
    await queryRunner.query(`DROP TABLE "clients"`);
  }
}
