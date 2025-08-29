import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async checkDb() {
    const started = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      const latencyMs = Date.now() - started;
      const opts: any = this.dataSource.options || {};

      return {
        status: 'up',
        message: '✅ Database connected successfully',
        details: {
          type: opts.type || 'mysql',
          host: opts.host,
          port: opts.port,
          database: opts.database,
          latencyMs,
        },
      };
    } catch (err: any) {
      return {
        status: 'down',
        message: '❌ Database is not connected',
        error: err?.message || String(err),
      };
    }
  }
}
