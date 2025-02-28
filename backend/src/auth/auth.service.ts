import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../users/users.schema';

/**
 * AuthService handles authentication logic, including user login, logout, and signup.
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Logs in a user by validating their credentials.
   * @param loginDto - An object containing the user's email and password.
   * @returns A promise that resolves to a partial UserDocument containing user information.
   * @throws An error if the credentials are invalid.
   */
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

  /**
   * Logs out the user.
   * @returns A message indicating successful logout.
   */
  async logout() {
    return { message: 'Logout successful' };
  }

  /**
   * Signs up a new user by creating their account.
   * @param user - An object containing user information (e.g., email, password).
   * @returns A promise that resolves to a partial UserDocument containing the new user's information.
   */
  async signup(user: Partial<User>): Promise<Partial<UserDocument>> {
    const newUser = await this.usersService
      .create(user)
      .then((user) => user.populate('role'));
    return {
      _id: newUser._id,
      name: newUser.name,
      firstname: newUser.firstname,
      email: newUser.email,
      role: newUser.role,
    };
  }

  /**
   * Generates a JWT token based on the provided payload.
   * @param payload - The data to be encoded in the JWT.
   * @returns A promise that resolves to the generated JWT token as a string.
   */
  async generateJwt(payload: any): Promise<string> {
    return this.jwtService.sign(payload);
  }
}
