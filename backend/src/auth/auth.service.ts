import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/users/users.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: {
    email: string;
    password: string;
  }): Promise<Partial<UserDocument>> {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (
      !user ||
      !(await this.usersService.validatePassword(user, loginDto.password))
    ) {
      throw new Error('Invalid credentials');
    }

    return {
      _id: user._id,
      name: user.name,
      firstname: user.firstname,
      email: user.email,
      role: user.role,
    };
  }

  async logout() {
    return { message: 'Logout successful' };
  }

  async signup(user: Partial<User>): Promise<Partial<UserDocument>> {
    const newUser = await this.usersService.create(user).then((user) => user.populate('role'));
      return {
        _id: newUser._id,
        name: newUser.name,
        firstname: newUser.firstname,
        email: newUser.email,
        role: newUser.role
    }
  }

  async generateJwt(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }
}
