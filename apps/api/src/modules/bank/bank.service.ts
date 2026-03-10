import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { XpService } from '../xp/xp.service';
import { UploadBankItemDto, CreateBankCommentDto, CreateBankRatingDto } from './dto/bank.dto';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BankService {
    private readonly logger = new Logger(BankService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly uploadService: UploadService,
        private readonly xpService: XpService,
    ) { }

    async uploadItem(userId: string, file: Express.Multer.File, dto: UploadBankItemDto) {
        if (!file) throw new BadRequestException('File is required');
        if (file.size > 20 * 1024 * 1024) throw new BadRequestException('File is too large (max 20MB)');

        // 1. Validate FileType safely (dynamic import for ESM-only package)
        const { fileTypeFromBuffer } = await import('file-type');
        const typeInfo = await fileTypeFromBuffer(file.buffer);

        if (!typeInfo) {
            throw new BadRequestException('Could not determine file type');
        }

        const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimes.includes(typeInfo.mime)) {
            throw new BadRequestException(`Format not allowed: ${typeInfo.mime}`);
        }

        // 2. Hash Calculation & Deduplication check
        const hashSum = crypto.createHash('sha256');
        hashSum.update(file.buffer);
        const fileHash = hashSum.digest('hex');

        const existingItem = await this.prisma.bankItem.findUnique({
            where: { fileHash },
            select: { id: true },
        });

        if (existingItem) {
            throw new BadRequestException('This exact file has already been uploaded to the bank.');
        }

        // 3. Upload to Cloudflare R2
        const key = `bank/${uuidv4()}.${typeInfo.ext}`;
        try {
            await this.uploadService.upload(file.buffer, key, typeInfo.mime);
        } catch (error) {
            throw new InternalServerErrorException('Error uploading to Cloud storage');
        }

        // 4. Save to Database
        const item = await this.prisma.bankItem.create({
            data: {
                title: dto.title,
                type: dto.type,
                subject: dto.subject,
                fileUrl: key, // We save the KEY here, not the public URL.
                fileHash: fileHash,
                uploadedBy: userId,
                institution: dto.institutionId,
                course: dto.courseId,
                professor: dto.professor,
                period: dto.period,
            },
        });

        // 5. Reward Uploader (+50 XP)
        await this.xpService.addXP(userId, 50, 'UPLOAD', item.id);

        return item;
    }

    async getItems(
        cursor?: string,
        take: number = 20,
        filters: { subject?: string; professor?: string; type?: string; period?: string; institutionId?: string; courseId?: string } = {},
        sort: 'recent' | 'rating' | 'comments' = 'recent'
    ) {
        const where: any = {};
        if (filters.subject) where.subject = filters.subject;
        if (filters.type) where.type = filters.type;
        if (filters.period) where.period = filters.period;
        if (filters.professor) where.professor = { contains: filters.professor, mode: 'insensitive' };
        if (filters.institutionId) where.institution = filters.institutionId; // Using string field currently
        if (filters.courseId) where.course = filters.courseId; // Using string field currently

        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'rating') orderBy = { rating: 'desc' };
        else if (sort === 'comments') orderBy = { comments: { _count: 'desc' } };

        const args: any = {
            take,
            where,
            orderBy,
            include: {
                uploader: { select: { id: true, username: true, avatarUrl: true, level: true } },
                _count: { select: { comments: true } }
            }
        };

        if (cursor) {
            args.cursor = { id: cursor };
            args.skip = 1;
        }

        const items = await this.prisma.bankItem.findMany(args);
        const nextCursor = items.length === take ? items[items.length - 1].id : null;

        return { data: items, nextCursor };
    }

    async getItemById(itemId: string) {
        const item = await this.prisma.bankItem.findUnique({
            where: { id: itemId },
            include: {
                uploader: { select: { id: true, username: true, avatarUrl: true, level: true } },
                comments: {
                    include: { author: { select: { id: true, username: true, avatarUrl: true, level: true } } },
                    orderBy: { upvotes: 'desc' },
                    take: 50
                }
            }
        });

        if (!item) throw new NotFoundException('Bank item not found');

        // Generate Pre-signed URL valid for 1 hour
        const signedUrl = await this.uploadService.getSignedUrl(item.fileUrl, 3600);

        return { ...item, downloadUrl: signedUrl };
    }

    async addComment(userId: string, itemId: string, dto: CreateBankCommentDto) {
        const item = await this.prisma.bankItem.findUnique({ where: { id: itemId } });
        if (!item) throw new NotFoundException('Bank item not found');

        return this.prisma.bankComment.create({
            data: {
                bankItemId: itemId,
                authorId: userId,
                body: dto.body,
                fileUrl: dto.fileUrl,
            },
            include: {
                author: { select: { id: true, username: true, avatarUrl: true, level: true } }
            }
        });
    }

    async addRating(userId: string, itemId: string, dto: CreateBankRatingDto) {
        const item = await this.prisma.bankItem.findUnique({ where: { id: itemId } });
        if (!item) throw new NotFoundException('Bank item not found');

        if (item.uploadedBy === userId) {
            throw new BadRequestException('You cannot rate your own upload');
        }

        // Upsert the rating
        const rating = await this.prisma.bankRating.upsert({
            where: {
                bankItemId_userId: { bankItemId: itemId, userId }
            },
            update: { score: dto.score },
            create: {
                bankItemId: itemId,
                userId: userId,
                score: dto.score,
            }
        });

        // Recalculate average asynchronously
        this.recalculateItemRating(itemId);

        return rating;
    }

    private async recalculateItemRating(itemId: string) {
        const agg = await this.prisma.bankRating.aggregate({
            where: { bankItemId: itemId },
            _avg: { score: true },
            _count: { score: true }
        });

        await this.prisma.bankItem.update({
            where: { id: itemId },
            data: {
                rating: agg._avg.score || 0,
                ratingCount: agg._count.score || 0,
            }
        });
    }
}
