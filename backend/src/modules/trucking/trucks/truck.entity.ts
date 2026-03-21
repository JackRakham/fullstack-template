import { BaseEntity } from "src/shared/models/base-entity";
import { TruckStatusEnum } from "src/shared/models/enums/truck-status.enum";
import { Column, Entity, OneToMany } from "typeorm";
import { TripEntity } from "../trips/trip.entity";

@Entity('trucks')
export class TruckEntity extends BaseEntity {
    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    plate: string;

    @Column({ nullable: true })
    model: string;

    @Column({ nullable: true })
    year: number;

    @Column({ nullable: true })
    color: string;

    @Column({ type: 'enum', enum: TruckStatusEnum, default: TruckStatusEnum.AVAILABLE })
    status: TruckStatusEnum;

    @OneToMany(() => TripEntity, trip => trip.truck)
    trips: TripEntity[];
}
