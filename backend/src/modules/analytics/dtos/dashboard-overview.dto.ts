import { ApiProperty } from '@nestjs/swagger';

export class EntityCountDto {
  @ApiProperty({ description: 'Name of the entity or category' })
  label: string;

  @ApiProperty({ description: 'Count value' })
  count: number;
}

export class DashboardOverviewDto {
  @ApiProperty({ description: 'Total number of users in the system' })
  totalUsers: number;

  @ApiProperty({ description: 'Total number of active users' })
  activeUsers: number;

  @ApiProperty({ description: 'Total number of inactive users' })
  inactiveUsers: number;

  @ApiProperty({ type: [EntityCountDto], description: 'User count by role' })
  usersByRole: EntityCountDto[];
}
