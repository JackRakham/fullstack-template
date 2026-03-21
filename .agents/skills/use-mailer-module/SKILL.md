---
name: use-mailer-module
description: Explains how to use the abstract Mailer System to send emails agnostic of the email provider (SMTP, SendGrid, SES).
---

# Use Mailer Module Skill

The backend implements an **Abstract Mailer Architecture** using the Strategy Pattern to keep outbound email operations agnostic of the underlying service provider.

Instead of hardcoding a platform (like Nodemailer, AWS SES, or SendGrid), the `MailerModule` dynamically injects the appropriate provider based on the `MAILER_PROVIDER` `.env` variable (which resolves through `ConfigKey.MAILER_PROVIDER` as `'local'`, `'sendgrid'`, or `'ses'`).

## Injecting and Using the Mailer Service

Whenever a module needs to send an email (e.g. Identity Module for welcome emails or password resets), you must inject the central `MailerService`. **Do not** import or inject the raw providers directly.

**Example Usage**:
```typescript
import { Injectable } from '@nestjs/common';
import { MailerService } from 'src/modules/mailer/mailer.service';
import { UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly mailerService: MailerService) {}

  async completeRegistration(user: UserEntity): Promise<void> {
    // Business logic for registration...
    
    // Dispatch welcome email using the central abstract service
    await this.mailerService.sendWelcomeEmail(user.email, user.name);
  }

  async triggerPasswordReset(email: string): Promise<void> {
    const token = 'generated_secure_token';
    // Dispatch password reset email
    await this.mailerService.sendPasswordResetEmail(email, token);
  }
}
```

## Adding New Email Templates
To add a new email template (e.g. `sendInvoiceEmail`), simply add a new method to `src/modules/mailer/mailer.service.ts`:

1. Define the method signature.
2. Build the `subject`, `text`, and `html` content.
3. Call `this.sendGenericEmail({ to, subject, text, html })`.
4. The service will automatically delegate the physical sending of the email to whichever provider is currently active in the `.env`.

### Local Development
When `MAILER_PROVIDER=local`, the system automatically uses `LocalMailerProvider` which relies on `nodemailer` and basic SMTP details (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). It is highly recommended to use a service like **Mailtrap** to safely capture local emails without spamming real addresses.
