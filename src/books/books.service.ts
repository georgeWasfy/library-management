import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Book } from './models/book.model';
import { CreateBookType, UpdateBookType } from './dto/book.schema';

@Injectable()
export class BooksService {
  constructor(private readonly sequelize: Sequelize) {}
  async create(createBookDto: CreateBookType): Promise<Book> {
    try {
      const data = {
        ...createBookDto,
        available_quantity: createBookDto.total_quantity,
      };
      return await Book.create(data);
    } catch (error) {
      throw new BadRequestException('Unable to create Book');
    }
  }

  async list(): Promise<Book[]> {
    try {
      return await Book.findAll();
    } catch (error) {
      throw new BadRequestException('Unable to list Books');
    }
  }

  async find(id: number): Promise<Book | null> {
    try {
      return await Book.findByPk(id);
    } catch (error) {
      throw new BadRequestException(`Unable to find Book with id ${id}`);
    }
  }

  async update(
    id: number,
    updateBookDto: UpdateBookType,
  ): Promise<Book | null> {
    const book = await Book.findByPk(id);
    if (!book) {
      throw new NotFoundException(`Book with id: ${id} not found`);
    }
    if (!this.isValidAvailability(updateBookDto, book)) {
      throw new BadRequestException(
        `Available quantity cannot be greater than total quantity`,
      );
    }
    try {
      const [affectedCount] = await Book.update(updateBookDto, {
        where: { id },
      });
      return await Book.findByPk(id);
    } catch (error) {
      throw new BadRequestException(`Unable to update Book with id ${id}`);
    }
  }

  async remove(id: number): Promise<boolean> {
    const destroyedRows = await Book.destroy({ where: { id } });
    return destroyedRows > 0;
  }

  isValidAvailability(bookToUpdate: UpdateBookType, book: Book) {
    if (bookToUpdate?.available_quantity && bookToUpdate?.total_quantity) {
      return bookToUpdate.total_quantity > bookToUpdate.available_quantity;
    }
    if (bookToUpdate?.available_quantity) {
      return book.total_quantity > bookToUpdate.available_quantity;
    }
    return true;
  }
}
