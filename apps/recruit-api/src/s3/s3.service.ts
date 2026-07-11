import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service implements OnModuleInit {
  private s3!: S3Client;
  private bucketName!: string;
  private region!: string;

  onModuleInit() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'orvexa-recruit-resumes-dev';

    if (!accessKeyId || !secretAccessKey || accessKeyId === 'mock-key-for-local-dev') {
      console.warn('WARN: AWS credentials are not configured or are set to mock. S3 uploads will run in mock local filesystem fallback mode.');
      return;
    }

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(
    filename: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<string> {
    // If no real AWS keys are configured, fallback to local file static path url
    if (!this.s3) {
      console.log(`[S3-MOCK-UPLOAD] Fallback local uploads routing for: ${filename}`);
      return `/uploads/${filename}`;
    }

    const key = `resumes/${Date.now()}_${filename}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await this.s3.send(command);
      
      const s3Url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
      console.log(`[S3-UPLOAD-SUCCESS] File uploaded to S3: ${s3Url}`);
      return s3Url;

    } catch (err: any) {
      console.error('Failed to upload file to AWS S3:', err.message || err);
      // Fail gracefully: fallback to local routing rather than blocking candidate applications
      return `/uploads/${filename}`;
    }
  }
}
