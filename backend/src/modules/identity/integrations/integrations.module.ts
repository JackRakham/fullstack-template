import { Module } from '@nestjs/common';
import { ExternalClientsProvider } from './external-clients.provider';
import { FIREBASE_ADMIN, AWS_CLIENT, GCP_CLIENT, SENDGRID_CLIENT } from './integration-tokens';

@Module({
  providers: [...ExternalClientsProvider],
  exports: [FIREBASE_ADMIN, AWS_CLIENT, GCP_CLIENT, SENDGRID_CLIENT],
})
export class IntegrationsModule {}
