import { MigrationInterface, QueryRunner } from "typeorm";

export class InitIncidents1783843353357 implements MigrationInterface {
    name = 'InitIncidents1783843353357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."incidents_severity_enum" AS ENUM('sev1', 'sev2', 'sev3', 'sev4')`);
        await queryRunner.query(`CREATE TYPE "public"."incidents_status_enum" AS ENUM('open', 'investigating', 'identified', 'monitoring', 'resolved', 'postmortem')`);
        await queryRunner.query(`CREATE TABLE "incidents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "severity" "public"."incidents_severity_enum" NOT NULL, "status" "public"."incidents_status_enum" NOT NULL DEFAULT 'open', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "resolved_at" TIMESTAMP WITH TIME ZONE, "reporter_id" uuid NOT NULL, "owner_id" uuid, CONSTRAINT "PK_ccb34c01719889017e2246469f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e2102fc64215f0a1fcb9ad4879" ON "incidents"  ("status", "severity") `);
        await queryRunner.query(`ALTER TABLE "incidents" ADD CONSTRAINT "FK_997933e2e9897cd680e453805ca" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD CONSTRAINT "FK_ace9955fdb7cd709f29208c3fcd" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incidents" DROP CONSTRAINT "FK_ace9955fdb7cd709f29208c3fcd"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP CONSTRAINT "FK_997933e2e9897cd680e453805ca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e2102fc64215f0a1fcb9ad4879"`);
        await queryRunner.query(`DROP TABLE "incidents"`);
        await queryRunner.query(`DROP TYPE "public"."incidents_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."incidents_severity_enum"`);
    }

}
