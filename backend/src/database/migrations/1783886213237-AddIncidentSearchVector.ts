import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIncidentSearchVector1783886213237 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "incidents" ADD COLUMN "search_vector" tsvector`);

    await queryRunner.query(`
      CREATE INDEX "IDX_incidents_search_vector" ON "incidents" USING GIN ("search_vector")
    `);

    await queryRunner.query(`
      CREATE FUNCTION incidents_search_vector_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
        RETURN NEW;
      END
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER incidents_search_vector_trigger
      BEFORE INSERT OR UPDATE OF title, description ON "incidents"
      FOR EACH ROW EXECUTE FUNCTION incidents_search_vector_update();
    `);

    await queryRunner.query(`
      UPDATE "incidents" SET
        search_vector =
          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(description, '')), 'B')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER "incidents_search_vector_trigger" ON "incidents"`);
    await queryRunner.query(`DROP FUNCTION "incidents_search_vector_update"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_incidents_search_vector"`);
    await queryRunner.query(`ALTER TABLE "incidents" DROP COLUMN "search_vector"`);
  }
}