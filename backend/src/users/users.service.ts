import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { Role, RoleDocument } from '../roles/roles.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

/**
 * UsersService is responsible for handling user-related operations,
 * including user creation, validation, and management.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * Finds a user by their email address.
   * @param {string} email - The email address of the user to find.
   * @returns {Promise<UserDocument | null>} - Returns the user document if found, otherwise null.
   */
  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).populate('role').exec();
  }

  /**
   * Creates a new user with the provided details.
   * Validates the user data and checks for existing users with the same email.
   * @param {Partial<User>} user - The user data to create.
   * @returns {Promise<UserDocument>} - Returns the created user document.
   * @throws {ConflictException} - If the email is already taken.
   * @throws {BadRequestException} - If any of the user data is invalid.
   * @throws {NotFoundException} - If the default role "employee" is not found.
   */
  async create(user: Partial<User>): Promise<UserDocument> {
    const existingUser = await this.findOneByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('Email already taken');
    }

    if (!this.isValidName(user.name)) {
      throw new BadRequestException('Invalid name');
    }
    if (!this.isValidName(user.firstname)) {
      throw new BadRequestException('Invalid first name');
    }
    if (!this.isValidPassword(user.password)) {
      throw new BadRequestException(
        'Password must be at least 6 characters long.',
      );
    }
    if (!this.isValidEmail(user.email)) {
      throw new BadRequestException('Invalid email');
    }
    if (this.isUnderage(user.birthDate)) {
      throw new BadRequestException('User must be at least 18 years old');
    }

    if (!this.isValidName(user.city)) {
      throw new BadRequestException('Invalid city');
    }
    if (!this.isValidZipcode(user.zipcode)) {
      throw new BadRequestException('Invalid zipcode');
    }
    const defaultRole = await this.roleModel.findOne({ name: 'employee' });
    if (!defaultRole) {
      throw new NotFoundException('Default role "employee" not found');
    }

    user.role = defaultRole._id as Types.ObjectId;
    user.password = await bcrypt.hash(user.password, 10);

    return await this.userModel.create(user); // The create method already returns the created user
  }

  /**
   * Validates the provided password against the user's stored password.
   * @param {User} user - The user whose password is to be validated.
   * @param {string} password - The password to validate.
   * @returns {Promise<boolean>} - Returns true if the password is valid, otherwise false.
   */
  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  /**
   * Retrieves all users from the database.
   * @returns {Promise<User[]>} - Returns an array of user documents.
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  /**
   * Removes a user by their ID, only if the requester has the necessary permissions.
   * @param {Types.ObjectId} id - The ID of the user to remove.
   * @param {string} token - The JWT token of the requester.
   * @returns {Promise<void>} - Returns nothing on success.
   * @throws {ForbiddenException} - If the requester is not an admin or lacks delete permissions.
   */
  async remove(id: Types.ObjectId, token: string): Promise<void> {
    const decodedToken = await this.jwtService.decode(token);
    if (decodedToken.role.name !== 'admin') {
      throw new ForbiddenException(
        'You must be an administrator to delete this user.',
      );
    }
    if (!decodedToken.role.permissions.includes('delete')) {
      throw new ForbiddenException(
        'You do not have permission to delete this user.',
      );
    }

    await this.userModel.deleteOne({ _id: id });
  }

  /**
   * Validates the provided password for length.
   * @param {string} password - The password to validate.
   * @returns {boolean} - Returns true if the password is valid (at least 6 characters), otherwise false.
   */
  public isValidPassword(password: string): boolean {
    // Checks if the password is empty or if its length is less than 6
    if (!password || password.length < 6) {
      return false;
    }
    return true; // Returns true if the password is valid
  }

  /**
   * Validates an email address format.
   * @param {string} email - The email address to validate.
   * @returns {boolean} - Returns true if the email is valid, otherwise false.
   */
  public isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Validates a name format (supports letters, spaces, apostrophes, and dashes).
   * @param {string} name - The name to validate.
   * @returns {boolean} - Returns true if the name is valid, otherwise false.
   */
  public isValidName(name: string): boolean {
    const namePattern = /^[A-Za-zÀ-ÿ'-]+(?:\s[A-Za-zÀ-ÿ'-]+)*$/; // Allow letters, spaces, apostrophes, dashes
    return namePattern.test(name);
  }

  /**
   * Validates a French zipcode format (must be exactly 5 digits).
   * @param {string} zipcode - The zipcode to validate.
   * @returns {boolean} - Returns true if the zipcode is valid, otherwise false.
   */
  public isValidZipcode(zipcode: string): boolean {
    const zipcodePattern = /^[0-9]{5}$/;
    return zipcodePattern.test(zipcode);
  }

  /**
   * Checks if the user is under 18 based on their birth date.
   * @param {Date} birthDate - The birth date in a valid date format.
   * @returns {boolean} - Returns true if the user is underage (less than 18), otherwise false.
   */
  public isUnderage(birthDate: Date): boolean {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age < 18; // Returns true if the user is underage
  }
}
