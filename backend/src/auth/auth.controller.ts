import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/users.schema';
import { Response } from 'express';

/**
 * AuthController handles authentication-related requests.
 * It provides endpoints for user login, logout, and signup.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Logs in a user by validating their credentials.
   * @param loginDto - An object containing the user's email and password.
   * @param res - The response object used to send the JWT token back to the client.
   * @returns A JSON object containing the JWT token and user information.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: { email: string; password: string },
    @Res() res: Response,
  ) {
    const payload = await this.authService.login(loginDto);
    const token = await this.authService.generateJwt(payload);

    res.setHeader('Authorization', `Bearer ${token}`);
    return res.json({
      token,
      user: payload,
    });
  }

  /**
   * Logs out the user.
   * @returns A message indicating successful logout.
   */
  @Post('logout')
  async logout() {
    return { message: 'Logged out successfully' };
  }

  /**
   * Signs up a new user by creating their account.
   * @param user - An object containing user information (e.g., email, password).
   * @param res - The response object used to send the JWT token back to the client.
   * @returns A response indicating the signup was successful.
   */
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() user: User, @Res() res: Response) {
    const payload = await this.authService.signup(user);
    const token = await this.authService.generateJwt(payload);

    res.setHeader('Authorization', `Bearer ${token}`);

    return res.send();
  }
}
