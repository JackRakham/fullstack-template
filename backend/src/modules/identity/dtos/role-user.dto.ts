import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class AssociateUsersDto {
    @ApiProperty({ type: [Number], description: 'List of user IDs to associate' })
    @IsArray()
    @IsInt({ each: true })
    userIds: number[];
}
