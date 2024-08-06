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

@Injectable()
export class UsersService {
  constructor(private readonly sequelize: Sequelize) {}
  async create(createUserDto: CreateUserType): Promise<User> {
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
      return await User.findByPk(id);
    } catch (error) {
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
}
