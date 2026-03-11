import { Controller, Get, Param, Query } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Institutions')
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) { }

  @Get()
  @ApiOperation({ summary: 'Search institutions by name or acronym (Returns max 20 items per page)' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  async searchInstitutions(
    @Query('search') search?: string,
    @Query('state') state?: string,
    @Query('page') page: string = '1',
  ) {
    return this.institutionsService.search(search, state, parseInt(page, 10));
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'List courses by institution ID' })
  async getCoursesByInstitution(@Param('id') institutionId: string) {
    return this.institutionsService.getCoursesByInstitution(institutionId);
  }
}
