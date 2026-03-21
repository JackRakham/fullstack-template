import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/shared/models/base-entity';
import { MediaStorageTypeEnum } from 'src/shared/models/enums/media-storage-type.enum';

@Entity('media')
export class MediaEntity extends BaseEntity {
  @Column()
  title: string;

  @Column()
  mimetype: string;

  @Column()
  path: string;

  @Column({
    type: 'enum',
    enum: MediaStorageTypeEnum,
    default: MediaStorageTypeEnum.LOCAL,
  })
  storage_type: MediaStorageTypeEnum;

  @Column({ type: 'bigint', nullable: true })
  size: number;
}
