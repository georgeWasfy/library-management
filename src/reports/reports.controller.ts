import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Header,
  Res,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';
import { TransformationPipe } from '@base/pipes/transformation.pipe';
import { ValidationPipe } from '@base/pipes/validation.pipe';
import { ReportFiltersSchema, ReportQueryType } from './dto/report.schema';

@Controller({ version: '1', path: 'reports' })
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('generate')
  async generate(
    @Query(new TransformationPipe(), new ValidationPipe(ReportFiltersSchema))
    query: ReportQueryType,
  ) {
    return await this.reportsService.generate(query.filters);
  }

  @Get(':id/download')
  @Header('Content-Type', 'text/xlsx')
  async download(@Param('id') id: string, @Res() res: Response) {
    const result = await this.reportsService.download(+id);
    res.download(`${result}`);
  }
}
