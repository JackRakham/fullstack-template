import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DashboardOverviewDto } from './dtos/dashboard-overview.dto';

/**
 * Dashboard service following the `calculate-app-metrics` skill standard.
 *
 * This service aggregates metrics from multiple domain modules.
 * It does NOT inject repositories directly — it calls other services
 * to maintain domain encapsulation.
 *
 * All metrics are cached with structured keys and TTL-based expiration.
 *
 * @see .agents/skills/calculate-app-metrics/SKILL.md
 */
@Injectable()
export class DashboardsService {
  private readonly logger = new Logger(DashboardsService.name);
  private readonly CACHE_TTL = 600_000; // 10 minutes

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    // Inject your domain services here, e.g.:
    // private readonly usersService: UsersService,
    // private readonly ordersService: OrdersService,
  ) {}

  /**
   * Main dashboard overview.
   * Aggregates user counts and role distribution.
   *
   * @example GET /dashboards/overview
   */
  async getOverview(): Promise<DashboardOverviewDto> {
    const cacheKey = 'metrics:dashboard:overview';
    const cached = await this.cache.get<DashboardOverviewDto>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache HIT for ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`Cache MISS for ${cacheKey}. Calculating metrics...`);

    // ──────────────────────────────────────────────────────
    // TODO: Replace with real service calls, e.g.:
    //
    // const totalUsers = await this.usersService.countAll();
    // const activeUsers = await this.usersService.countByStatus('active');
    // const usersByRole = await this.usersService.countByRole();
    // ──────────────────────────────────────────────────────

    const result: DashboardOverviewDto = {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      usersByRole: [],
    };

    await this.cache.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }
}
