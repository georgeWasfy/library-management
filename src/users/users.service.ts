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
import { literal, Op } from 'sequelize';

@Injectable()
export class UsersService {
  private defaultInclude = [
    {
      model: Borrowings,
      as: 'borrowed_books',
      where: { is_returned: false },
      required: false,
      include: [{ model: Book, as: 'book' }],
    },
  ];
  constructor(private readonly sequelize: Sequelize) {}
  async create(createUserDto: CreateUserType): Promise<User> {
    const emailExist = await User.findOne({
      where: { email: createUserDto.email },
    });
    if (emailExist) {
      throw new BadRequestException('This email already exist');
    }
    try {
      return await User.create(createUserDto);
    } catch (error) {
      throw new BadRequestException('Unable to create user');
    }
  }

  async list(): Promise<User[]> {
    try {
      return await User.findAll();
    } catch (error) {
      throw new BadRequestException('Unable to list users');
    }
  }

  async find(id: number): Promise<User | null> {
    try {
      return await User.findByPk(id, { include: this.defaultInclude });
    } catch (error) {
      console.log('🚀 ~ UsersService ~ find ~ error:', error);
      throw new BadRequestException(`Unable to find user with id ${id}`);
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserType,
  ): Promise<User | null> {
    try {
      const [affectedCount] = await User.update(updateUserDto, {
        where: { id },
      });
      if (affectedCount === 0) {
        throw new NotFoundException(`User with id: ${id} not found`);
      }
      return await User.findByPk(id);
    } catch (error) {
      throw new BadRequestException(`Unable to update user with id ${id}`);
    }
  }

  async remove(id: number): Promise<boolean> {
    const destroyedRows = await User.destroy({ where: { id } });
    return destroyedRows > 0;
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
      //step1: check for books availability
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

      //step2: create borrowing transaction
      const created_borrowings = await Borrowings.bulkCreate(borrowings, {
        transaction,
      });
      //step3: decrement available_quantity by one
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
    borrowings: {
      book_id: number;
      user_id: number;
      due_date: Date;
    }[],
  ): Promise<[number, string | null]> {
    const user = await this.find(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    const transaction = await this.sequelize.transaction();
    const book_ids = borrowings.map((b) => b.book_id);
    try {
      //step1: update borrowing transaction
      const [affectedCount] = await Borrowings.update(
        {
          return_date: Date.now(),
          is_returned: true,
          is_overdue: literal(
            'CASE WHEN CURDATE() > due_date THEN 1 ELSE 0 END',
          ),
        },
        {
          where: { user_id: id, book_id: { [Op.in]: book_ids } },
          transaction,
        },
      );
      //step2: increment available_quantity by one
      await Book.update(
        {
          available_quantity: literal('available_quantity + 1'),
        },
        {
          where: { id: { [Op.in]: book_ids } },
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
