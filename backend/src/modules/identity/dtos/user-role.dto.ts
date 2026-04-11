import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class AssociateRolesDto {
    @ApiProperty({ type: [Number], description: 'List of role IDs to associate' })
    @IsArray()
    @IsInt({ each: true })
    roleIds: number[];
}
