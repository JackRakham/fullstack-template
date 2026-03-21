---
name: use-storage-module
description: Explains how to use the abstract Storage Module and MediaEntity to manage file uploads and attachments agnostic of the cloud provider.
---

# Use Storage Module Skill

The backend implements an **Abstract Storage Architecture** using the Strategy Pattern to keep file uploads agnostic of the underlying infrastructure.

Instead of hardcoding a platform (like local disk, AWS S3, or Google Cloud Storage), the `StorageModule` dynamically injects the appropriate provider based on the `STORAGE_PROVIDER` `.env` variable (`'local'`, `'s3'`, `'gcs'`).

At the heart of this system is the `MediaEntity`, which serves as the "Single Source of Truth" for any attachment in the application. Always relate entities (Trucks, Users, Trips) to `MediaEntity` rather than storing loose URL strings.

## Injecting and Using the Storage Service

Whenever a new module needs to upload a document or link an external file, you must use the central `StorageService`.

**Example Usage**:
```typescript
import { Injectable } from '@nestjs/common';
import { StorageService } from 'src/modules/storage/storage.service';

@Injectable()
export class UserAvatarsService {
  constructor(private readonly storageService: StorageService) {}

  async uploadAvatar(file: Express.Multer.File): Promise<MediaEntity> {
    // This physically uploads the file (to local/s3/gcs) 
    // and saves the metadata row in the 'media' table.
    return await this.storageService.uploadFile(file, 'Avatar Upload', 'avatars');
  }

  async linkExternalAvatar(url: string): Promise<MediaEntity> {
    // This doesn't physically upload anything, but tracks the link in the DB.
    return await this.storageService.saveExternalLink('External Avatar', url);
  }

  async deleteAvatar(mediaId: number): Promise<void> {
    // This deletes the physical file from the active provider AND the row in the DB.
    await this.storageService.deleteMedia(mediaId);
  }
}
```

## How Files are Served

The `StorageController` exposes standard endpoints. The most important is serving/redirecting files:
- **`GET /storage/:id/serve`**: When this endpoint is hit, the application evaluates the `storage_type` of the `MediaEntity`. 
  - If it is `EXTERNAL`, the API issues an HTTP Redirect to the external URL.
  - If it is `LOCAL`, `S3`, or `GCS`, the active provider is asked for the public URL path and the request is redirected there.

### Rule of Thumb
Never directly reference the `MediaEntity.path` attribute on the frontend. Always construct your UI `src` tags using `/storage/{id}/serve`. This ensures links do not break if we swap from Local Storage to S3 in the future.
