import { Module } from '@nestjs/common';
import { TrucksService } from './trucks.service';
import { TrucksController } from './trucks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TruckEntity } from './truck.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TruckEntity])],
  providers: [TrucksService],
  controllers: [TrucksController]
})
export class TrucksModule { }
