import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TruckEntity } from '../../trucks/truck.entity';
import { TripEntity } from '../../trips/trip.entity';
import { TruckTripsService } from './truck-trips.service';
import { TruckTripsController } from './truck-trips.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TruckEntity, TripEntity])],
  providers: [TruckTripsService],
  controllers: [TruckTripsController],
})
export class TruckTripsModule {}
