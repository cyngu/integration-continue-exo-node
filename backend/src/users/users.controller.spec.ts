import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service'; // Import the UsersService for user-related operations
import { JwtService } from '@nestjs/jwt'; // Import JwtService for handling JWT operations

// Describe the test suite for UsersController
describe('UsersController', () => {
  let controller: UsersController; // Declare a variable to hold the instance of UsersController
  let mockUsersService: any; // Declare a variable for the mocked UsersService
  let mockJwtService: any; // Declare a variable for the mocked JwtService

  // Set up the testing environment before each test
  beforeEach(async () => {
    // Create a mock implementation of UsersService
    mockUsersService = {
      create: jest.fn(), // Mock the create method
      findAll: jest.fn(), // Mock the findAll method
      findOneByEmail: jest.fn(), // Mock the findOneByEmail method
      remove: jest.fn(), // Mock the remove method
    };

    // Create a mock implementation of JwtService
    mockJwtService = {
      // Add methods to mock for JwtService as needed
      verify: jest.fn(), // Mock the verify method
    };

    // Create a testing module with the UsersController and mocked services
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController], // Register the UsersController
      providers: [
        {
          provide: UsersService, // Provide the mocked UsersService
          useValue: mockUsersService,
        },
        {
          provide: JwtService, // Provide the mocked JwtService
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
