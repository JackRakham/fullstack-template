export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export interface IMailerProvider {
  /**
   * Sends an email via the active provider.
   * @param options Object containing standard email properties.
   */
  sendEmail(options: SendEmailOptions): Promise<void>;
}
