import { MigrationInterface, QueryRunner } from "typeorm";

export class InitIncidentEvents1783848412436 implements MigrationInterface {
    name = 'InitIncidentEvents1783848412436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."incident_events_type_enum" AS ENUM('created', 'status_change', 'severity_change', 'assignment_change', 'comment', 'attachment_added')`);
        await queryRunner.query(`CREATE TABLE "incident_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."incident_events_type_enum" NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "incident_id" uuid NOT NULL, "author_id" uuid NOT NULL, CONSTRAINT "PK_1230e0a50df3503eed115634297" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_390f216bd2d62482f4a2602b5e" ON "incident_events"  ("incident_id") `);
        await queryRunner.query(`ALTER TABLE "incident_events" ADD CONSTRAINT "FK_390f216bd2d62482f4a2602b5e8" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "incident_events" ADD CONSTRAINT "FK_0a05594f9c70621f02050d1e26d" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "incident_events" DROP CONSTRAINT "FK_0a05594f9c70621f02050d1e26d"`);
        await queryRunner.query(`ALTER TABLE "incident_events" DROP CONSTRAINT "FK_390f216bd2d62482f4a2602b5e8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_390f216bd2d62482f4a2602b5e"`);
        await queryRunner.query(`DROP TABLE "incident_events"`);
        await queryRunner.query(`DROP TYPE "public"."incident_events_type_enum"`);
    }

}
