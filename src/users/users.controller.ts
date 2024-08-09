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
  Query,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  BorrowBooksBodySchema,
  BorrowBooksBodyType,
  CreateUserSchema,
  CreateUserType,
  ReturnBooksBodySchema,
  ReturnBooksBodyType,
  UpdateUserSchema,
  UpdateUserType,
  UserQuerySchema,
  UserQueryType,
} from './dto/user.schema';
import { ValidationPipe } from '@base/pipes/validation.pipe';
import { TransformationPipe } from '@base/pipes/transformation.pipe';

@Controller({ version: '1', path: 'users' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe(CreateUserSchema))
  async create(@Body() createUserDto: CreateUserType) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Query(new TransformationPipe(), new ValidationPipe(UserQuerySchema))
    query: UserQueryType,
  ) {
    return await this.usersService.list(query.paging);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.find(+id);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user;
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
    return { data: { borrowings: created_borrowings } };
  }

  @Post(':id/return')
  async restore(
    @Param('id') id: string,
    @Body(new ValidationPipe(ReturnBooksBodySchema))
    borrowBody: ReturnBooksBodyType,
  ) {
    const [restored_borrowings, error] = await this.usersService.restore(
      +id,
      borrowBody.books,
    );

    if (error) {
      throw new BadRequestException(error);
    }
    return { data: { returned_borrowings: restored_borrowings } };
  }
}
