import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { User } from './models/user.model';
import {
  CreateUserType,
  UpdateUserType,
} from './dto/user.schema';
import { Borrowings } from '@base/borrowings/models/borrowing.model';
import { Book } from '@base/books/models/book.model';
import { ValidationError, literal, Op } from 'sequelize';
import { Meta, PaginatedRequestType } from '@base/schema/helpers.schema';

@Injectable()
export class UsersService {
  private defaultInclude = [
    {
      model: Borrowings,
      as: 'borrowings',
      where: { is_returned: false },
      required: false,
      include: [{ model: Book, as: 'book' }],
    },
  ];
  constructor(private readonly sequelize: Sequelize) {}
  async create(
    createUserDto: CreateUserType,
  ): Promise<{ data: { user: User } }> {
    try {
      const user = await User.create(createUserDto);
      return { data: { user } };
    } catch (error) {
      if (error instanceof ValidationError) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new BadRequestException('This email already exist');
        }
      }
      throw new BadRequestException('Unable to create user');
    }
  }

  async list(pagination?: PaginatedRequestType): Promise<{
    data: User[];
    meta: Meta;
  }> {
    try {
      let defaultPaging = undefined;
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
      const total = await User.count();
      const users = await User.findAll({ ...defaultPaging });
      return {
        data: users,
        meta: {
          total,
          current_page: pagination?.page ?? null,
          per_page: pagination?.per_page ?? null,
        },
      };
    } catch (error) {
      throw new BadRequestException('Unable to list users');
    }
  }

  async find(id: number): Promise<{ data: { user: User } } | null> {
    try {
      const user = await User.findByPk(id, { include: this.defaultInclude});
      return user ? { data: { user } } : null;
    } catch (error) {
      throw new BadRequestException(`Unable to find user with id ${id}`);
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserType,
  ): Promise<{ data: { user: User } } | null> {
    try {
      const [affectedCount] = await User.update(updateUserDto, {
        where: { id },
      });
      if (affectedCount === 0) {
        throw new NotFoundException(`User with id: ${id} not found`);
      }
      const user = await User.findByPk(id);
      return user ? { data: { user } } : null;
    } catch (error) {
      if (error instanceof ValidationError) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new BadRequestException('This email already exist');
        }
      }
      throw new BadRequestException(`Unable to update user with id ${id}`);
    }
  }

  async remove(id: number): Promise<{ data: { removed: boolean } }> {
    const destroyedRows = await User.destroy({ where: { id } });
    return { data: { removed: destroyedRows > 0 } };
  }

  async borrow(
    id: number,
    borrowings: {
      book_id: number;
      user_id: number;
      due_date: Date;
    }[],
  ): Promise<[Borrowings[], string | null]> {
    const user = await this.find(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    const transaction = await this.sequelize.transaction();
    const book_ids = borrowings.map((b) => b.book_id);
    try {
      //step1: check if user already has the books borrowed
      const userAlreadyBorrowed = await Borrowings.findAll({
        where: {
          user_id: id,
          book_id: { [Op.in]: book_ids },
          is_returned: false
        },
        transaction,
      });
      if (userAlreadyBorrowed.length > 0) {
        await transaction.commit();
        return [
          [],
          'Some of the books are already borowed by the user... please check the user borrowings',
        ];
      }

      //step2: check for books availability
      const booksAvailability = await Book.findAll({
        where: {
          available_quantity: { [Op.gt]: 0 },
          id: { [Op.in]: book_ids },
        },
        transaction,
      });
      if (booksAvailability.length < book_ids.length) {
        await transaction.commit();
        return [
          [],
          'Some of the books requested are not available... please check availability of each book',
        ];
      }

      //step3: create borrowing transaction
      const created_borrowings = await Borrowings.bulkCreate(borrowings, {
        transaction,
      });
      //step4: decrement available_quantity by one
      await Book.update(
        {
          available_quantity: literal('available_quantity - 1'),
        },
        {
          where: { id: { [Op.in]: book_ids } },
          transaction,
        },
      );
      await transaction.commit();
      return [created_borrowings, null];
    } catch (error) {
      await transaction.rollback();
      throw new BadRequestException(`Unable to process this transaction`);
    }
  }

  async restore(
    id: number,
    books: number[],
  ): Promise<[number, string | null]> {
    const user = await this.find(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    const transaction = await this.sequelize.transaction();
    try {
      //step1: update borrowing transaction
      const [affectedCount] = await Borrowings.update(
        {
          return_date: Date.now(),
          is_returned: true,
        },
        {
          where: { user_id: id, book_id: { [Op.in]: books } },
          transaction,
        },
      );
      //step2: increment available_quantity by one
      await Book.update(
        {
          available_quantity: literal('available_quantity + 1'),
        },
        {
          where: { id: { [Op.in]: books } },
          transaction,
        },
      );
      await transaction.commit();
      return [affectedCount, null];
    } catch (error) {
      await transaction.rollback();
      throw new BadRequestException(`Unable to process this transaction`);
    }
  }
}
