import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Res, ConflictException, NotFoundException, BadRequestException,
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
  async login(
    @Body() loginDto: { email: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const payload = await this.authService.login(loginDto);
      const token = await this.authService.generateJwt(payload);

      return res
        .status(200)
        .header('Authorization', `Bearer ${token}`)
        .json({ token, user: payload });
    } catch (error) {
      console.log('Login error:', error);

      // For login errors, return 401 Unauthorized
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }
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
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() user: User, @Res() res: Response) {
    try {
      console.log('Signup request:', user);
      const payload = await this.authService.signup(user);
      const token = await this.authService.generateJwt(payload);

      return res
        .status(201)
        .header('Authorization', `Bearer ${token}`)
        .json({ token, user: payload });
    } catch (error) {
      console.log('Signup error:', error);

      // Map errors to appropriate HTTP status codes
      if (error instanceof ConflictException) {
        return res.status(409).json({ message: error.message });
      } else if (error instanceof NotFoundException) {
        return res.status(404).json({ message: error.message });
      } else if (error instanceof BadRequestException) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
