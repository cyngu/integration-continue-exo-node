import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './users.schema';
import { Role } from '../roles/roles.schema';
import * as bcrypt from 'bcryptjs';
import {
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import mongoose, { Model } from 'mongoose';

/**
 * Unit tests for the UsersService.
 * This file contains tests for all methods in the UsersService class,
 * ensuring that the service behaves as expected under various conditions.
 */
describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;
  let mockJwtService: any;

  const mockRole = {
    _id: new mongoose.Types.ObjectId(),
    name: 'employee',
    permissions: [],
  };

  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'test@example.com',
    password: 'password123',
    name: 'John',
    firstname: 'Doe',
    birthDate: new Date('2000-01-01'),
    city: 'Paris',
    zipcode: '75001',
    role: mockRole._id,
  };

  const adminToken = 'valid.admin.token';
  const employeeToken = 'valid.employee.token';

  /**
   * Setup before each test.
   * This function initializes the testing module and mocks necessary services.
   */
  beforeEach(async () => {
    // Mock user model methods
    userModel = {
      findOne: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn(),
        }),
      }),
      create: jest.fn().mockResolvedValue(mockUser),
      deleteOne: jest.fn(),
      find: jest.fn(),
    };

    mockJwtService = {
      decode: jest.fn(),
    };

    // Create a testing module with mocked providers
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        {
          provide: getModelToken(Role.name), // Add role model
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockRole), // Mock role model method
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<jest.Mocked<Model<UserDocument>>>(
      getModelToken(User.name),
    );
    mockJwtService = module.get<JwtService>(JwtService);
  });

  /**
   * Cleanup after each test.
   * This function clears all mocks to avoid interference between tests.
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test to ensure the service is defined.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tests for the create method
  describe('create', () => {
    /**
     * Test to check if ConflictException is thrown when email already exists.
     */
    it('should throw ConflictException if email already exists', async () => {
      userModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      } as any);
      await expect(service.create(mockUser)).rejects.toThrow(ConflictException);
    });

    /**
     * Test to check if BadRequestException is thrown for invalid name.
     */
    it('should throw BadRequestException if name is invalid', async () => {
      const invalidUser = { ...mockUser, name: 'Invalid Name 123' };
      userModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null), // Simulate no existing user
        }),
      } as any);
      await expect(service.create(invalidUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    /**
     * Test to ensure a user is created successfully.
     */
    it('should create a user successfully', async () => {
      // Mock findOne to return null (user doesn't exist)
      userModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      } as any);
      // Simulate the creation of a user
      userModel.create.mockResolvedValueOnce(mockUser);

      // Call the create method of the service
      const result = await service.create(mockUser);

      // Verify that the create method was called with the correct parameters
      expect(userModel.create).toHaveBeenCalledWith({
        ...mockUser,
        role: mockRole._id, // Ensure the role is included
      });

      // Verify that the result is correct
      expect(result).toEqual(mockUser);
    });
  });

  // Tests for the findOneByEmail method
  describe('findOneByEmail', () => {
    /**
     * Test to ensure a user is returned if found by email.
     */
    it('should return a user if found', async () => {
      userModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      } as any);
      const user = await service.findOneByEmail(mockUser.email);
      expect(user).toEqual(mockUser);
    });

    /**
     * Test to ensure null is returned if user is not found.
     */
    it('should return null if user not found', async () => {
      userModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      } as any);
      const user = await service.findOneByEmail('notfound@example.com');
      expect(user).toBeNull();
    });
  });

  // Tests for the remove method
  describe('remove', () => {
    /**
     * Test to check if ForbiddenException is thrown if user is not admin.
     */
    it('should throw ForbiddenException if user is not admin', async () => {
      mockJwtService.decode.mockReturnValue({
        role: { name: 'employee', permissions: ['read'] },
      });
      await expect(service.remove(mockUser._id, employeeToken)).rejects.toThrow(
        ForbiddenException,
      );
    });

    /**
     * Test to ensure a user is deleted successfully if the user is admin.
     */
    it('should delete a user successfully', async () => {
      mockJwtService.decode.mockReturnValue({
        role: { name: 'admin', permissions: ['delete', 'read'] },
      });
      userModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await service.remove(mockUser._id, adminToken);
      expect(userModel.deleteOne).toHaveBeenCalledWith({
        _id: mockUser._id,
      });
    });
  });

  // Tests for the validatePassword method
  describe('validatePassword', () => {
    /**
     * Test to ensure true is returned if the password is valid.
     */
    it('should return true if password is valid', async () => {
      const user: User = {
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'John',
        firstname: 'Doe',
        birthDate: new Date('2000-01-01'),
        city: 'Paris',
        zipcode: '75001',
        role: mockRole._id,
      };

      const isValid = await service.validatePassword(user, 'password123');
      expect(isValid).toBe(true);
    });

    /**
     * Test to ensure false is returned if the password is invalid.
     */
    it('should return false if password is invalid', async () => {
      const user: User = {
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'John',
        firstname: 'Doe',
        birthDate: new Date('2000-01-01'),
        city: 'Paris',
        zipcode: '75001',
        role: mockRole._id,
      };

      const isValid = await service.validatePassword(user, 'wrongpassword');
      expect(isValid).toBe(false);
    });
  });

  // Tests for the findAll method
  describe('findAll', () => {
    /**
     * Test to ensure an array of users is returned.
     */
    it('should return an array of users', async () => {
      const usersArray = [
        mockUser,
        { ...mockUser, email: 'another@example.com' },
      ];
      userModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(usersArray), // Simulate returning an array of users
      } as any);

      const users = await service.findAll();
      expect(users).toEqual(usersArray);
    });

    /**
     * Test to ensure an empty array is returned if no users are found.
     */
    it('should return an empty array if no users are found', async () => {
      userModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([]), // Simulate no existing users
      } as any);

      const users = await service.findAll();
      expect(users).toEqual([]); // Expect an empty array
    });
  });

  // Tests for the isUnderage method
  describe('isUnderage', () => {
    /**
     * Test to check if the method returns true for a date of birth resulting in an age under 18.
     */
    it('should return true for a date of birth resulting in an age under 18', () => {
      const today = new Date();
      const underageBirthDate = new Date(
        today.getFullYear() - 17,
        today.getMonth(),
        today.getDate() + 1,
      );
      expect(service.isUnderage(underageBirthDate)).toBe(true);
    });

    /**
     * Test to check if the method returns false for a date of birth resulting in an age 18 or over.
     */
    it('should return false for a date of birth resulting in an age 18 or over', () => {
      const today = new Date();
      const adultBirthDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );
      expect(service.isUnderage(adultBirthDate)).toBe(false);
    });

    /**
     * Test to check if the method returns true for a person who will turn 18 this year.
     */
    it('should return true for a person who will turn 18 in this year', () => {
      const today = new Date();
      const future18thBirthday = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate(),
      );
      expect(service.isUnderage(future18thBirthday)).toBe(true);
    });
  });

  // Tests for the isValidEmail method
  describe('isValidEmail', () => {
    /**
     * Test to ensure the method returns true for valid email formats.
     */
    it('should return true for valid email formats', () => {
      expect(service.isValidEmail('test@example.com')).toBe(true);
      expect(service.isValidEmail('user.name+tag+sorting@example.com')).toBe(
        true,
      );
    });

    /**
     * Test to ensure the method returns false for invalid email formats.
     */
    it('should return false for invalid email formats', () => {
      expect(service.isValidEmail('plainaddress')).toBe(false);
      expect(service.isValidEmail('@missingusername.com')).toBe(false);
      expect(service.isValidEmail('test@.com')).toBe(false);
      expect(service.isValidEmail('')).toBe(false);
    });
  });

  // Tests for the isValidName method
  describe('isValidName', () => {
    /**
     * Test to ensure the method returns true for valid names.
     */
    it('should return true for valid names', () => {
      expect(service.isValidName('Cyril')).toBe(true);
      expect(service.isValidName('Loïse')).toBe(true);
      expect(service.isValidName('Cyril-Nguyen')).toBe(true);
      expect(service.isValidName("O'Nguyen")).toBe(true);
    });

    /**
     * Test to ensure the method returns false for invalid names.
     */
    it('should return false for invalid names', () => {
      expect(service.isValidName('Cyril123')).toBe(false);
      expect(service.isValidName('')).toBe(false);
    });
  });

  // Tests for the isValidZipcode method
  describe('isValidZipcode', () => {
    /**
     * Test to ensure the method returns true for valid French zip codes.
     */
    it('should return true for valid French zip codes', () => {
      expect(service.isValidZipcode('75001')).toBe(true);
    });

    /**
     * Test to ensure the method returns false for invalid zip codes.
     */
    it('should return false for invalid zip codes', () => {
      expect(service.isValidZipcode('1234')).toBe(false);
      expect(service.isValidZipcode('123456')).toBe(false);
      expect(service.isValidZipcode('abcde')).toBe(false);
      expect(service.isValidZipcode('')).toBe(false);
    });
  });

  // Tests for the isValidPassword method
  describe('isValidPassword', () => {
    /**
     * Test to ensure the method returns true for valid passwords.
     */
    it('should return true for valid passwords', () => {
      expect(service.isValidPassword('validPassword123')).toBe(true);
    });

    /**
     * Test to ensure the method returns false for invalid passwords.
     */
    it('should return false for invalid passwords', () => {
      expect(service.isValidPassword('short')).toBe(false);
      expect(service.isValidPassword('')).toBe(false); // Test for an empty password
    });
  });
});
