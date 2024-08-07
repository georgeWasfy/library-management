import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  BorrowBooksBodySchema,
  BorrowBooksBodyType,
  CreateUserSchema,
  CreateUserType,
  UpdateUserSchema,
  UpdateUserType,
} from './dto/user.schema';
import { ValidationPipe } from '@base/pipes/validation.pipe';

@Controller({ version: '1', path: 'users' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe(CreateUserSchema))
  async create(@Body() createUserDto: CreateUserType) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return await this.usersService.list();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.find(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserType,
  ) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(+id);
  }

  @Post(':id/borrow')
  async borrow(
    @Param('id') id: string,
    @Body(new ValidationPipe(BorrowBooksBodySchema))
    borrowBody: BorrowBooksBodyType,
  ) {
    const borrowings = borrowBody.borrowings.map((element) => {
      return { ...element, user_id: +id };
    });
    const [created_borrowings, error] = await this.usersService.borrow(
      +id,
      borrowings,
    );

    if (error) {
      throw new BadRequestException(error);
    }
    return created_borrowings;
  }

  @Post(':id/return')
  async restore(
    @Param('id') id: string,
    @Body(new ValidationPipe(BorrowBooksBodySchema))
    borrowBody: BorrowBooksBodyType,
  ) {
    const borrowings = borrowBody.borrowings.map((element) => {
      return { ...element, user_id: +id };
    });
    const [restored_borrowings, error] = await this.usersService.restore(
      +id,
      borrowings,
    );

    if (error) {
      throw new BadRequestException(error);
    }
    return restored_borrowings;
  }
}
