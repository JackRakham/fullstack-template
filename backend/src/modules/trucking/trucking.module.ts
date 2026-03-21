import { Module } from '@nestjs/common';
import { TrucksModule } from './trucks/trucks.module';
import { TripsModule } from './trips/trips.module';
import { TruckTripsModule } from './relationships/truck-trips/truck-trips.module';

@Module({
  imports: [TrucksModule, TripsModule, TruckTripsModule]
})
export class TruckingModule {}
