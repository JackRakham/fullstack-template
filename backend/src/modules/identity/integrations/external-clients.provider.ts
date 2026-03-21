import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FIREBASE_ADMIN, AWS_CLIENT, GCP_CLIENT, SENDGRID_CLIENT } from './integration-tokens';

export const ExternalClientsProvider: Provider[] = [
  {
    provide: FIREBASE_ADMIN,
    useFactory: (configService: ConfigService) => {
      const config = configService.get('integrations.firebase');
      if (!config.projectId) return null;
      // const admin = require('firebase-admin');
      // return admin.initializeApp({ ... });
      return { info: 'Firebase Admin Placeholder', ...config };
    },
    inject: [ConfigService],
  },
  {
    provide: AWS_CLIENT,
    useFactory: (configService: ConfigService) => {
      const config = configService.get('integrations.aws');
      if (!config.accessKeyId) return null;
      return { info: 'AWS Client Placeholder', ...config };
    },
    inject: [ConfigService],
  },
  {
    provide: GCP_CLIENT,
    useFactory: (configService: ConfigService) => {
      const config = configService.get('integrations.gcp');
      if (!config.projectId) return null;
      return { info: 'GCP Client Placeholder', ...config };
    },
    inject: [ConfigService],
  },
  {
    provide: SENDGRID_CLIENT,
    useFactory: (configService: ConfigService) => {
      const config = configService.get('integrations.sendgrid');
      if (!config.apiKey) return null;
      return { info: 'Sendgrid Client Placeholder', ...config };
    },
    inject: [ConfigService],
  },
];
