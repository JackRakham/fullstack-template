import { Module } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { DashboardsController } from './dashboards.controller';

/**
 * Analytics module for cross-domain metrics and dashboards.
 *
 * This module follows the `calculate-app-metrics` skill standard (Section 3).
 * It is dedicated exclusively to reading and aggregation —
 * it does NOT own any entities or handle mutations.
 *
 * To add domain-specific metrics:
 * 1. Import the related domain module (e.g. IdentityModule)
 * 2. Inject its service into DashboardsService
 * 3. Call the service's metrics method and compose the dashboard response
 *
 * @see .agents/skills/calculate-app-metrics/SKILL.md
 */
@Module({
  imports: [
    // Import domain modules whose services you'll call for metrics, e.g.:
    // IdentityModule,
  ],
  providers: [DashboardsService],
  controllers: [DashboardsController],
})
export class AnalyticsModule {}
