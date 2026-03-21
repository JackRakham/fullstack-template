import { BaseEntity } from "src/shared/models/base-entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { TruckEntity } from "../trucks/truck.entity";

@Entity('trips')
export class TripEntity extends BaseEntity {
    @Column()
    po_number: string;

    @ManyToOne(() => TruckEntity, truck => truck.trips)
    @JoinColumn({ name: 'truck_id' })
    truck: TruckEntity;
}