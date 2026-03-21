import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDate } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { TruckStatusEnum } from 'src/shared/models/enums/truck-status.enum';

export class CreateTruckDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    plate: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    model: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    year: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    color: string;

    @ApiProperty()
    @IsNotEmpty()
    status: TruckStatusEnum;
}

export class UpdateTruckDto extends PartialType(CreateTruckDto) { }

export class TruckResponseDto {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    plate: string;

    @ApiProperty()
    @Expose()
    model: string;

    @ApiProperty()
    @Expose()
    year: number;

    @ApiProperty()
    @Expose()
    color: string;

    @ApiProperty()
    @Expose()
    status: TruckStatusEnum;

    @ApiProperty()
    @Expose()
    created_at: Date;

    @ApiProperty()
    @Expose()
    updated_at: Date;
}
