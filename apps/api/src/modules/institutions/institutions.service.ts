import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async search(searchTerm?: string) {
    if (!searchTerm || searchTerm.length < 2) {
      // Se não tem busca, traz 50 variadas ativas
      return this.prisma.institution.findMany({
        where: { active: true },
        take: 50,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          emecCode: true,
          name: true,
          shortName: true,
          state: true,
          type: true,
        }
      });
    }

    return this.prisma.institution.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { shortName: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      take: 50,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        emecCode: true,
        name: true,
        shortName: true,
        state: true,
        type: true,
      }
    });
  }

  async getCoursesByInstitution(institutionId: string) {
    return this.prisma.course.findMany({
      where: { institutionId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        area: true,
      }
    });
  }
}
