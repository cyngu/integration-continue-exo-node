import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/users/users.schema';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string; password: string }, @Res() res: Response) {
    const payload = await this.authService.login(loginDto);
    const token = await this.authService.generateJwt(payload);

    res.setHeader('Authorization', `Bearer ${token}`);

    return res.send();
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return this.authService.logout();
  }

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() user: User, @Res() res: Response) {
    const payload = await this.authService.signup(user);
    const token = await this.authService.generateJwt(payload);

    res.setHeader('Authorization', `Bearer ${token}`);
    
    return res.send();
  }
}
