import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface AuditContext {
  userId?: number;
  ipAddress?: string;
}

@Injectable()
export class AlsService {
  private readonly als = new AsyncLocalStorage<AuditContext>();

  runWithContext(context: AuditContext, callback: () => void) {
    return this.als.run(context, callback);
  }

  getStore(): AuditContext | undefined {
    return this.als.getStore();
  }

  getUserId(): number | undefined {
    return this.getStore()?.userId;
  }
}
