import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service'; // Ensure to import AuthService

/**
 * Unit tests for the AuthController.
 * This file contains tests for the AuthController class,
 * ensuring that the controller behaves as expected under various conditions.
 */
describe('AuthController', () => {
  let controller: AuthController; // Instance of AuthController to be tested
  let mockAuthService: any; // Mocked AuthService

  /**
   * Setup before each test.
   * This function initializes the testing module and mocks necessary services.
   */
  beforeEach(async () => {
    // Mock AuthService methods
    mockAuthService = {
      login: jest.fn(), // Mock login method
      generateJwt: jest.fn(), // Mock JWT generation method
      signup: jest.fn(), // Mock signup method
    };

    // Create a testing module with mocked providers
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService, // Use the mocked AuthService
        },
      ],
    }).compile();

    // Retrieve the AuthController instance
    controller = module.get<AuthController>(AuthController);
  });

  /**
   * Test to ensure the controller is defined.
   */
  it('should be defined', () => {
    expect(controller).toBeDefined(); // Check that the controller is defined
  });
});
