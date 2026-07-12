import { MigrationInterface, QueryRunner } from "typeorm";

export class InitAuditLogs1783868152164 implements MigrationInterface {
    name = 'InitAuditLogs1783868152164'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actor_id" character varying NOT NULL, "actor_email" character varying NOT NULL, "action" character varying NOT NULL, "entity_type" character varying NOT NULL, "entity_id" uuid, "metadata" jsonb, "ip_address" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_177183f29f438c488b5e8510cd" ON "audit_logs"  ("actor_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7421efc125d95e413657efa3c6" ON "audit_logs"  ("entity_type", "entity_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7421efc125d95e413657efa3c6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_177183f29f438c488b5e8510cd"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
    }

}
