import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { redisConfig } from '../config/redis.conf';

@Injectable()
export class SimpleLockService implements OnModuleInit {
  private client: RedisClientType;

  public constructor(
    @Inject(redisConfig.KEY)
    private readonly redisConf: ConfigType<typeof redisConfig>,
  ) {}

  public async onModuleInit(): Promise<void> {
    this.client = createClient({ url: `redis://${this.redisConf.host}:${this.redisConf.port}` });

    await this.client.connect();
  }

  public async acquireLock(key: string, ttl: number): Promise<boolean> {
    // creates key only if it not exists yet
    const result = await this.client.set(key, 'locked', { NX: true, PX: ttl });

    return result === 'OK';
  }

  public releaseLock(key: string): Promise<number> {
    return this.client.del(key);
  }
}
