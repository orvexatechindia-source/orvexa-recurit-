import { Injectable, OnModuleInit } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { EmailPayload } from '@orvexa/notifications';

@Injectable()
export class SesService implements OnModuleInit {
  private sesClient!: SESClient;
  private senderEmail!: string;

  onModuleInit() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';
    this.senderEmail = process.env.AWS_SES_SENDER_EMAIL || 'noreply@orvexatech.io';

    if (!accessKeyId || !secretAccessKey || accessKeyId === 'mock-key-for-local-dev') {
      console.warn('WARN: AWS credentials are set to mock. SES notifications will run in console-logger fallback mode.');
      return;
    }

    this.sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async sendEmail(payload: EmailPayload): Promise<void> {
    if (!this.sesClient) {
      console.log(`\n================== [SES MOCK EMAIL] ==================`);
      console.log(`From: ${this.senderEmail}`);
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Body (Plain): ${payload.bodyText}`);
      console.log(`=====================================================\n`);
      return;
    }

    try {
      const command = new SendEmailCommand({
        Source: this.senderEmail,
        Destination: {
          ToAddresses: [payload.to],
        },
        Message: {
          Subject: {
            Data: payload.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: payload.bodyHtml,
              Charset: 'UTF-8',
            },
            Text: {
              Data: payload.bodyText,
              Charset: 'UTF-8',
            },
          },
        },
      });

      await this.sesClient.send(command);
      console.log(`[SES-EMAIL-SUCCESS] Transactional email sent to ${payload.to} successfully.`);
    } catch (err: any) {
      console.error('[SES-EMAIL-ERROR] Failed to send email via AWS SES:', err.message || err);
    }
  }
}
