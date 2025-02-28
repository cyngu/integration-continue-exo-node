import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';

// Describe the test suite for UsersController
describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: any;
  let mockJwtService: any;

  // Set up the testing environment before each test
  beforeEach(async () => {
    mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOneByEmail: jest.fn(),
      remove: jest.fn(),
    };

    mockJwtService = {
      verify: jest.fn(),
    };

    // Create a testing module with the UsersController and mocked services
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController], // Register the UsersController
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile(); // Compile the testing module

    // Retrieve the instance of UsersController from the testing module
    controller = module.get<UsersController>(UsersController);
  });

  // Test to ensure the controller is defined
  it('should be defined', () => {
    expect(controller).toBeDefined(); // Expect the controller to be defined
  });
});
