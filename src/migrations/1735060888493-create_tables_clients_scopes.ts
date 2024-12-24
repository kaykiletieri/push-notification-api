import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTablesClientsScopes1735060888493 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "clients" (
                "id" uuid NOT NULL,
                "client_id" character varying NOT NULL UNIQUE,
                "client_secret" character varying NOT NULL,
                "description" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_clients_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "scopes" (
                "id" uuid NOT NULL,
                "name" character varying NOT NULL UNIQUE,
                "description" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_scopes_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "client_scopes" (
                "client_id" uuid NOT NULL,
                "scope_id" uuid NOT NULL,
                CONSTRAINT "PK_client_scopes" PRIMARY KEY ("client_id", "scope_id"),
                CONSTRAINT "FK_client_scopes_client" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE CASCADE,
                CONSTRAINT "FK_client_scopes_scope" FOREIGN KEY ("scope_id") REFERENCES "scopes" ("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "client_scopes"
        `);

        await queryRunner.query(`
            DROP TABLE "scopes"
        `);

        await queryRunner.query(`
            DROP TABLE "clients"
        `);
    }
}
