---
name: use-queue-module
description: Explains how to use the BullMQ system for background job processing and task queueing in the backend.
---

# Use Queue Module Skill

The backend implements a **Background Job Processing System** using **BullMQ** and **Redis**. This is used for long-running or unreliable tasks like sending emails, processing files, or generating reports without blocking the main event loop or the user's request.

## Architecture

1. **QueueModule**: A global module (`src/modules/queue/queue.module.ts`) that manages the Redis connection.
2. **Queues**: Named channels where jobs are added.
3. **Processors**: Workers that listen for jobs in a specific queue and execute the business logic.

## 1. Registering a Queue in a Module

To use a queue in a specific module (e.g., `ReportsModule`), register it using `BullModule.registerQueue`:

```typescript
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reports_queue',
    }),
  ],
  providers: [ReportsService, ReportsProcessor],
})
export class ReportsModule {}
```

## 2. Adding Jobs to the Queue

Inject the queue into your service and use the `add` method:

```typescript
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ReportsService {
  constructor(@InjectQueue('reports_queue') private readonly reportsQueue: Queue) {}

  async generateMonthlyReport(userId: number): Promise<void> {
    await this.reportsQueue.add('generate', { userId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }
}
```

## 3. Creating a Processor

Create a class decorated with `@Processor` and extend `WorkerHost`:

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('reports_queue')
export class ReportsProcessor extends WorkerHost {
  async process(job: Job<any>): Promise<any> {
    if (job.name === 'generate') {
      const { userId } = job.data;
      // Long-running logic here...
    }
  }
}
```

## Configuration
Ensure these variables are set in your `.env`:
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD` (if applicable)
