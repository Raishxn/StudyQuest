import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class UploadValidationPipe implements PipeTransform {
    private readonly ALLOWED_MIME_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp'
    ];
    private readonly MAX_SIZE = 20 * 1024 * 1024; // 20MB

    async transform(value: any) {
        if (!value) {
            throw new BadRequestException('Nenhum arquivo enviado');
        }

        // Check size
        if (value.size > this.MAX_SIZE) {
            throw new BadRequestException('Arquivo excede o limite de 20MB');
        }

        // Dynamic import to support ESM-only file-type package in a CJS build
        const { fileTypeFromBuffer } = await import('file-type');
        const type = await fileTypeFromBuffer(value.buffer);

        if (!type || !this.ALLOWED_MIME_TYPES.includes(type.mime)) {
            throw new BadRequestException('Tipo de arquivo não permitido ou inválido. Apenas PDF, JPEG, PNG e WEBP.');
        }

        // Override the mimetype with the actual verified type for safety
        value.mimetype = type.mime;

        return value;
    }
}
