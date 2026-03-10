import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly logger = new Logger(UploadService.name);

    constructor(private configService: ConfigService) {
        const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
        const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
        this.bucketName = this.configService.get<string>('R2_BUCKET_NAME', 'studyquest');

        if (!accountId || !accessKeyId || !secretAccessKey) {
            this.logger.warn('Cloudflare R2 credentials are not fully configured in environment variables.');
        }

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    async upload(buffer: Buffer, key: string, mimeType: string): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
            });

            await this.s3Client.send(command);
            return key;
        } catch (error: any) {
            this.logger.error(`Error uploading to R2: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to upload file to storage');
        }
    }

    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            // 3600s = 1 hour
            const url = await getSignedUrl(this.s3Client, command, { expiresIn });
            return url;
        } catch (error: any) {
            this.logger.error(`Error generating signed url: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to generate access link');
        }
    }

    async delete(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
        } catch (error: any) {
            this.logger.error(`Error deleting from R2: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to delete file from storage');
        }
    }
}
