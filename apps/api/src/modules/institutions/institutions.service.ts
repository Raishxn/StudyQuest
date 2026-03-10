import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) { }

  async search(searchTerm?: string, page: number = 1) {
    const take = 20;
    const skip = (page - 1) * take;

    if (!searchTerm || searchTerm.length < 2) {
      // Se não tem busca, traz variadas ativas
      return this.prisma.institution.findMany({
        where: { active: true },
        take,
        skip,
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
      take,
      skip,
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
