import {
  Headers,
  Controller,
  Post,
  Body,
  Query,
  Get,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.schema';
import { JwtGuard } from '../guards/jwt.guards';
import { Types } from 'mongoose';

/**
 * UsersController is responsible for handling user-related HTTP requests.
 * It provides endpoints for creating users, retrieving user information,
 * and deleting users, with appropriate authentication guards.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Endpoint to create a new user.
   * @param {Partial<User>} user - The user data to create.
   * @returns {Promise<User>} - Returns the created user.
   */
  @Post()
  async create(@Body() user: Partial<User>) {
    return this.usersService.create(user);
  }

  /**
   * Endpoint to retrieve all users.
   * This endpoint is protected by the JwtGuard.
   * @returns {Promise<User[]>} - Returns an array of users.
   */
  @UseGuards(JwtGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  /**
   * Endpoint to retrieve a user by their email address.
   * This endpoint is protected by the JwtGuard.
   * @param {string} email - The email address of the user to retrieve.
   * @returns {Promise<User>} - Returns the user if found.
   */
  @UseGuards(JwtGuard)
  @Get(':email') // Route to retrieve a user by email
  async findOneByEmail(@Param('email') email: string): Promise<User> {
    return this.usersService.findOneByEmail(email);
  }

  /**
   * Endpoint to delete a user by their ID.
   * This endpoint is protected by the JwtGuard.
   * @param {Types.ObjectId} id - The ID of the user to delete.
   * @param {string} authHeader - The authorization header containing the JWT.
   * @returns {Promise<void>} - Returns nothing on successful deletion.
   */
  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: Types.ObjectId,
    @Headers('authorization') authHeader: string,
  ): Promise<void> {
    const token = authHeader.split(' ')[1]; // Retrieve the Bearer token
    // You can now use the token as necessary
    return this.usersService.remove(id, token);
  }
}
