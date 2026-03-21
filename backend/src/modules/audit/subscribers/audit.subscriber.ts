import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
  Repository,
} from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { AlsService } from '../als.service';
import { IS_AUDITABLE_KEY } from '../decorators/auditable.decorator';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(AuditSubscriber.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly alsService: AlsService,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {
    this.dataSource.subscribers.push(this);
  }

  private isAuditable(entity: any): boolean {
    if (!entity) return false;
    return Reflect.getMetadata(IS_AUDITABLE_KEY, entity.constructor) === true;
  }

  async afterInsert(event: InsertEvent<any>) {
    if (!this.isAuditable(event.entity)) return;

    await this.createLog(event, 'INSERT', null, event.entity);
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (!this.isAuditable(event.entity)) return;

    await this.createLog(event, 'UPDATE', event.databaseEntity, event.entity);
  }

  async beforeRemove(event: RemoveEvent<any>) {
    if (!this.isAuditable(event.databaseEntity)) return;

    await this.createLog(event, 'DELETE', event.databaseEntity, null);
  }

  private async createLog(event: any, action: string, oldValues: any, newValues: any) {
    try {
      const context = this.alsService.getStore();
      
      const log = this.auditLogRepository.create({
        table_name: event.metadata.tableName,
        entity_id: event.entity?.id?.toString() || event.databaseEntity?.id?.toString() || 'unknown',
        action,
        old_values: oldValues,
        new_values: newValues,
        user_id: context?.userId,
        ip_address: context?.ipAddress,
      });

      await this.auditLogRepository.save(log);
    } catch (error) {
      this.logger.error(`Error saving audit log for ${event.metadata.tableName}`, error.stack);
    }
  }
}
