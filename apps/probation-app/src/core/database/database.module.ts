import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Duration } from 'luxon';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { CampaignReportEntity } from '../../app/campaign-reports/campaign-report.entity';
import { appConfig } from '../config/app.config';
import { dbConfig } from '../config/db.config';
import { redisConfig } from '../config/redis.conf';
import { CreateCampaignReportsTable0000000000001 } from './migrations/create-campaign_reports_table-0000000000001';

const entities: PostgresConnectionOptions['entities'] = [CampaignReportEntity];
const migrations: PostgresConnectionOptions['migrations'] = [CreateCampaignReportsTable0000000000001];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [appConfig.KEY, dbConfig.KEY, redisConfig.KEY],
      useFactory: (
        appConf: ConfigType<typeof appConfig>,
        dbConf: ConfigType<typeof dbConfig>,
        redisConf: ConfigType<typeof redisConfig>,
      ): PostgresConnectionOptions => ({
        // credentials
        type: 'postgres',
        host: dbConf.host,
        username: dbConf.user,
        password: dbConf.password,
        database: dbConf.database,

        // cache credentials
        cache: {
          type: 'redis',
          duration: dbConf.cacheDurationMs,
          options: { host: redisConf.host, port: redisConf.port },
        },

        // common settings
        synchronize: false,
        migrationsRun: true,
        migrationsTransactionMode: 'all',
        applicationName: appConf.name,
        isolateWhereStatements: true,
        logging: ['query', 'error'],
        maxQueryExecutionTime: Duration.fromObject({ seconds: 1 }).as('millisecond'),

        entities,
        migrations,
      }),
    }),
  ],
})
export class DatabaseModule {}
