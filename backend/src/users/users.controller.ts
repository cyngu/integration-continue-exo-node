import {
  Headers,
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.schema';
import { JwtGuard } from "../guards/jwt.guards";


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() user: Partial<User>) {
    return this.usersService.create(user);
  }

  @UseGuards(JwtGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ): Promise<void> {
    const token = authHeader.split(' ')[1]; // Récupérer le token Bearer
    // Vous pouvez maintenant utiliser le token comme nécessaire
     return this.usersService.remove(id, token);

  }

}