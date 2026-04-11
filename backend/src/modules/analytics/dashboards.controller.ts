import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { DashboardsService } from './dashboards.service';
import { DashboardOverviewDto } from './dtos/dashboard-overview.dto';

@ApiTags('Dashboards')
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get main dashboard overview metrics' })
  @ApiOkResponse({ type: DashboardOverviewDto })
  async getOverview(): Promise<DashboardOverviewDto> {
    return this.dashboardsService.getOverview();
  }
}
