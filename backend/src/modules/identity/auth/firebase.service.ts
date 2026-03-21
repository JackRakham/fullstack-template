import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { ConfigKey } from 'src/config/config.keys';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>(ConfigKey.FIREBASE_PROJECT_ID);
    const clientEmail = this.configService.get<string>(ConfigKey.FIREBASE_CLIENT_EMAIL);
    const privateKey = this.configService.get<string>(ConfigKey.FIREBASE_PRIVATE_KEY);

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase credentials not fully configured. Firebase Auth will not be available.');
      return;
    }

    try {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      this.logger.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Error initializing Firebase Admin SDK', error.stack);
    }
  }

  async verifyToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    if (!this.firebaseApp) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    return this.firebaseApp.auth().verifyIdToken(idToken);
  }
}
