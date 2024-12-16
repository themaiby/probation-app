import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCampaignReportsTable0000000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'campaign_reports',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'ad',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'ad_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'adgroup',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'adgroup_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'campaign',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'campaign_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'client_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'event_name',
            type: 'enum',
            enum: ['install', 'purchase'],
            isNullable: false,
          },
          {
            name: 'event_time',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // unique index
    await queryRunner.createIndex(
      'campaign_reports',
      new TableIndex({
        name: 'unique_event_index',
        columnNames: ['event_time', 'client_id', 'event_name'],
        isUnique: true,
      }),
    );

    // aggregation index
    await queryRunner.createIndex(
      'campaign_reports',
      new TableIndex({
        name: 'idx_event_name_event_time_ad_id',
        columnNames: ['event_name', 'event_time', 'ad_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('campaign_reports', 'unique_event_index');
    await queryRunner.dropIndex('campaign_reports', 'idx_event_name_event_time_ad_id');
    await queryRunner.dropTable('campaign_reports');
  }
}
