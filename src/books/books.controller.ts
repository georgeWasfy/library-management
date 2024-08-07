import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  Query,
} from '@nestjs/common';
import { BooksService } from './books.service';
import {
  BookQuerySchema,
  BookQueryType,
  CreateBookSchema,
  CreateBookType,
  UpdateBookSchema,
  UpdateBookType,
} from './dto/book.schema';
import { ValidationPipe } from '@base/pipes/validation.pipe';
import { TransformationPipe } from '@base/pipes/transformation.pipe';

@Controller({ version: '1', path: 'books' })
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UsePipes(new ValidationPipe(CreateBookSchema))
  async create(@Body() createBookDto: CreateBookType) {
    return await this.booksService.create(createBookDto);
  }

  @Get()
  async findAll(
    @Query(new TransformationPipe(), new ValidationPipe(BookQuerySchema))
    query: BookQueryType,
  ) {
    return await this.booksService.list(query.filters, query.page);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.booksService.find(+id);
  }
  
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe(UpdateBookSchema)) updateBookDto: UpdateBookType,
  ) {
    return await this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.booksService.remove(+id);
  }
}
