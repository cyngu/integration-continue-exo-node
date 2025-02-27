import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service'; // Import UsersService
import { JwtService } from '@nestjs/jwt'; // Import JwtService

/**
 * Unit tests for the AuthService.
 * This file contains tests for the AuthService class,
 * ensuring that the service behaves as expected under various conditions.
 */
describe('AuthService', () => {
  let service: AuthService; // Instance of AuthService to be tested
  let mockUsersService: any; // Mocked UsersService
  let mockJwtService: any; // Mocked JwtService

  /**
   * Setup before each test.
   * This function initializes the testing module and mocks necessary services.
   */
  beforeEach(async () => {
    // Mock UsersService methods
    mockUsersService = {
      findOneByEmail: jest.fn(), // Mock method to find a user by email
      validatePassword: jest.fn(), // Mock method to validate user password
      create: jest.fn(), // Mock method to create a user
    };

    // Mock JwtService methods
    mockJwtService = {
      sign: jest.fn(), // Mock method to sign a JWT
    };

    // Create a testing module with mocked providers
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService, // Use the mocked UsersService
        },
        {
          provide: JwtService,
          useValue: mockJwtService, // Use the mocked JwtService
        },
      ],
    }).compile();

    // Retrieve the AuthService instance
    service = module.get<AuthService>(AuthService);
  });

  /**
   * Test to ensure the service is defined.
   */
  it('should be defined', () => {
    expect(service).toBeDefined(); // Check that the service is defined
  });
});
