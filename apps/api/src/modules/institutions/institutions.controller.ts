import { Controller, Get, Param, Query } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Institutions')
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  @ApiOperation({ summary: 'Search institutions by name or acronym (Returns max 50 items)' })
  @ApiQuery({ name: 'search', required: false, type: String })
  async searchInstitutions(@Query('search') search?: string) {
    return this.institutionsService.search(search);
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'List courses by institution ID' })
  async getCoursesByInstitution(@Param('id') institutionId: string) {
    return this.institutionsService.getCoursesByInstitution(institutionId);
  }
}
