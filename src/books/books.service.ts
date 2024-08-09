import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Book } from './models/book.model';
import {
  BookFilterType,
  BookWhereClause,
  CreateBookType,
  UpdateBookType,
} from './dto/book.schema';
import { Meta, PaginatedRequestType } from '@base/schema/helpers.schema';
import { Borrowings } from '@base/borrowings/models/borrowing.model';
import { User } from '@base/users/models/user.model';
import { Op, ValidationError } from 'sequelize';

@Injectable()
export class BooksService {
  private defaultInclude = {
    model: Borrowings,
    as: 'borrowings',
    where: { is_returned: false },
    required: false,
    include: [{ model: User, as: 'user' }],
  };
  constructor(private readonly sequelize: Sequelize) {}
  async create(
    createBookDto: CreateBookType,
  ): Promise<{ data: { book: Book } }> {
    try {
      const data = {
        ...createBookDto,
        available_quantity: createBookDto.total_quantity,
      };
      const book = await Book.create(data);
      return { data: { book } };
    } catch (error) {
      if (error instanceof ValidationError) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new BadRequestException('A book with same ISBN already exists');
        }
      }
      throw new BadRequestException('Unable to create Book');
    }
  }

  async list(
    filters?: BookFilterType,
    pagination?: PaginatedRequestType,
  ): Promise<{
    data: Book[];
    meta: Meta;
  }> {
    let defaultWhere = undefined;
    let defaultPaging = undefined;
    let defaultInclude = this.defaultInclude;
    try {
      if (filters && Object.keys(filters).length > 0) {
        defaultWhere = this.parseFilters(filters);
        if (filters?.is_borrowed !== undefined) {
          defaultInclude = {
            ...defaultInclude,
            required: true,
          };
        }
        if (filters?.is_overdue !== undefined) {
          defaultInclude = {
            ...defaultInclude,
            required: true,
            where: {
              ...defaultInclude.where,
              //@ts-ignore
              due_date: filters.is_overdue
                ? { [Op.lt]: Date.now() }
                : { [Op.gt]: Date.now() },
              is_returned: false,
            },
          };
        }
      }
      if (
        pagination &&
        pagination.page !== null &&
        pagination.per_page !== null
      ) {
        defaultPaging = {
          offset: (pagination.page - 1) * pagination.per_page,
          limit: pagination.per_page,
        };
      }
      const total = await Book.count({
        ...defaultWhere,
        include: defaultInclude,
      });
      const books = await Book.findAll({
        ...defaultWhere,
        ...defaultPaging,
        include: defaultInclude,
      });
      return {
        data: books,
        meta: {
          total,
          current_page: pagination?.page ?? null,
          per_page: pagination?.per_page ?? null,
        },
      };
    } catch (error) {
      throw new BadRequestException('Unable to list Books');
    }
  }

  async find(id: number): Promise<{ data: { book: Book } } | null> {
    try {
      const book = await Book.findByPk(id, {include: this.defaultInclude});
      return book ? { data: { book } } : null;
    } catch (error) {
      throw new BadRequestException(`Unable to find Book with id ${id}`);
    }
  }

  async update(
    id: number,
    updateBookDto: UpdateBookType,
  ): Promise<{ data: { book: Book } } | null> {
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
      if (affectedCount === 0) {
        throw new NotFoundException(`Book with id: ${id} not found`);
      }
      const book = await Book.findByPk(id);
      return book ? { data: { book } } : null;
    } catch (error) {
      if (error instanceof ValidationError) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new BadRequestException('A book with same ISBN already exists');
        }
      }
      throw new BadRequestException(`Unable to update Book with id ${id}`);
    }
  }

  async remove(id: number): Promise<{ data: { removed: boolean } }> {
    const destroyedRows = await Book.destroy({ where: { id } });
    return { data: { removed: destroyedRows > 0 } };
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

  parseFilters(filter: BookFilterType) {
    const whereClause: BookWhereClause = { where: {} };
    if (filter?.author !== undefined) {
      whereClause.where['author'] = filter.author;
    }
    if (filter?.isbn !== undefined) {
      whereClause.where['isbn'] = filter.isbn;
    }
    if (filter?.title !== undefined) {
      whereClause.where['title'] = filter.title;
    }
    return whereClause;
  }
}
