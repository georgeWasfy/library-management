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
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';
import { TransformationPipe } from '@base/pipes/transformation.pipe';
import { ValidationPipe } from '@base/pipes/validation.pipe';
import { ReportFiltersSchema, ReportQueryType } from './dto/report.schema';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '@base/auth/decorator/public.decorator';

@Controller({ version: '1', path: 'reports' })
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('generate')
  async generate(
    @Query(new TransformationPipe(), new ValidationPipe(ReportFiltersSchema))
    query: ReportQueryType,
  ) {
    const fileId = await this.reportsService.generate(query.filters);
    return {data: {fileId}}
  }

  @UseGuards(ThrottlerGuard)
  @Get(':id/download')
  @Public()
  @Header('Content-Type', 'text/xlsx')
  async download(@Param('id') id: string, @Res() res: Response) {
    const result = await this.reportsService.download(+id);
    res.download(`${result}`);
  }
}
