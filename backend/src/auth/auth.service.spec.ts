import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

/**
 * Unit tests for the AuthService.
 * This file contains tests for the AuthService class,
 * ensuring that the service behaves as expected under various conditions.
 */
describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;

  /**
   * Setup before each test.
   * This function initializes the testing module and mocks necessary services.
   */
  beforeEach(async () => {
    mockUsersService = {
      findOneByEmail: jest.fn(),
      validatePassword: jest.fn(),
      create: jest.fn(),
    };


    mockJwtService = {
      sign: jest.fn(),
    };

    // Create a testing module with mocked providers
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
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
