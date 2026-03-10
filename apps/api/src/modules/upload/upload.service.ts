import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UploadService {
    private readonly supabase: SupabaseClient;
    private readonly bucketName: string;
    private readonly logger = new Logger(UploadService.name);

    constructor(private configService: ConfigService) {
        // Try getting SUPABASE_URL, fallback to NEXT_PUBLIC_SUPABASE_URL if that's what Railway uses
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');

        // Use service role key if available, otherwise fallback to anon key
        const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || this.configService.get<string>('NEXT_PUBLIC_SUPABASE_ANON_KEY');

        this.bucketName = this.configService.get<string>('SUPABASE_BUCKET_NAME', 'studyquest');

        if (!supabaseUrl || !supabaseKey) {
            this.logger.warn('Supabase URL or Key are missing in environment variables. Uploads will fail.');
        }

        this.supabase = createClient(supabaseUrl || '', supabaseKey || '');
    }

    async upload(buffer: Buffer, key: string, mimeType: string): Promise<string> {
        try {
            const { data, error } = await this.supabase
                .storage
                .from(this.bucketName)
                .upload(key, buffer, {
                    contentType: mimeType,
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                this.logger.error(`Error uploading to Supabase: ${error.message}`);
                throw new InternalServerErrorException('Failed to upload file to storage');
            }

            return key;
        } catch (error: any) {
            this.logger.error(`Exception uploading to Supabase: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to upload file to storage');
        }
    }

    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            const { data, error } = await this.supabase
                .storage
                .from(this.bucketName)
                .createSignedUrl(key, expiresIn);

            if (error) {
                this.logger.error(`Error generating signed url: ${error.message}`);
                throw new InternalServerErrorException('Failed to generate access link');
            }

            return data?.signedUrl || '';
        } catch (error: any) {
            this.logger.error(`Exception generating signed url: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to generate access link');
        }
    }

    async delete(key: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .storage
                .from(this.bucketName)
                .remove([key]);

            if (error) {
                this.logger.error(`Error deleting from Supabase: ${error.message}`);
                throw new InternalServerErrorException('Failed to delete file from storage');
            }
        } catch (error: any) {
            this.logger.error(`Exception deleting from Supabase: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to delete file from storage');
        }
    }
}
