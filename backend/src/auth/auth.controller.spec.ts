import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * Unit tests for the AuthController.
 * This file contains tests for the AuthController class,
 * ensuring that the controller behaves as expected under various conditions.
 */
describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  /**
   * Setup before each test.
   * This function initializes the testing module and mocks necessary services.
   */
  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn(),
      generateJwt: jest.fn(),
      signup: jest.fn(),
    };

    // Create a testing module with mocked providers
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
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
