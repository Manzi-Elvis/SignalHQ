import { MigrationInterface, QueryRunner } from "typeorm";

export class InitAttachments1783863691686 implements MigrationInterface {
    name = 'InitAttachments1783863691686'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "attachments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "original_name" character varying NOT NULL, "storage_key" character varying NOT NULL, "mime_type" character varying NOT NULL, "size_bytes" bigint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "incident_id" uuid NOT NULL, "uploaded_by" uuid NOT NULL, CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD CONSTRAINT "FK_f306a9b7bd7e77c0faa1d304013" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD CONSTRAINT "FK_e25812e3fd9b3f3edf11b2c5d58" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_e25812e3fd9b3f3edf11b2c5d58"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_f306a9b7bd7e77c0faa1d304013"`);
        await queryRunner.query(`DROP TABLE "attachments"`);
    }

}
