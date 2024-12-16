import { EventName } from '@probation-app/probation-api-client';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'campaign_reports' })
@Index('unique_event_index', ['eventTime', 'clientId', 'eventName'], { unique: true }) // unique index
@Index('idx_event_name_event_time_ad_id', ['eventName', 'eventTime', 'adId']) // index to optimize aggregate queries
export class CampaignReportEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ name: 'ad' })
  public ad: string;

  @Column({ name: 'ad_id' })
  public adId: string;

  @Column({ name: 'adgroup' })
  public adGroup: string;

  @Column({ name: 'adgroup_id' })
  public adGroupId: string;

  @Column({ name: 'campaign' })
  public campaign: string;

  @Column({ name: 'campaign_id' })
  public campaignId: string;

  @Column({ name: 'client_id' })
  public clientId: string;

  @Column({ name: 'event_name', type: 'enum', enum: EventName })
  public eventName: EventName;

  @Column({ name: 'event_time', type: 'timestamp' })
  public eventTime: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  public updatedAt!: Date;
}
