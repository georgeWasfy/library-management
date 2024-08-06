import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserSchema,
  CreateUserType,
  UpdateUserSchema,
  UpdateUserType,
} from './dto/user.schema';
import { ValidationPipe } from '@base/pipes/validation.pipe';

@Controller('users')
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
  @UsePipes(new ValidationPipe(UpdateUserSchema))
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserType) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(+id);
  }
}
