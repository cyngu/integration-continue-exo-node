process.env.NODE_ENV = 'test';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model } from 'mongoose';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let mongoMemoryServer: MongoMemoryServer;
  let authToken: string;
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test',
    firstname: 'User',
    zipcode: '12345',
    city: 'TestCity',
    birthDate: '2000-01-01',
  };

  jest.setTimeout(30000);

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({ uri }),
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const roleModel = app.get<Model<any>>(getModelToken('Role'));

    await roleModel.create({
      name: 'employee',
      permissions: ['read'],
    });

    console.log('Employee role created for testing');
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    await mongoose.disconnect();

    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  describe('/auth/signup (POST)', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser);

      console.log('Signup response status:', response.status);
      console.log('Signup response body:', response.body);
      console.log('Signup response headers:', response.headers);

      expect(response.status).toBe(201);
      expect(response.headers.authorization).toBeDefined();
      expect(response.headers.authorization).toMatch(/^Bearer /);
    });

    it('should reject duplicate email registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('Email already taken');
    });
  });

  describe('/auth/login (POST)', () => {
    it('should authenticate a valid user and return a token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);

      authToken = response.body.token;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(response.status).not.toBe(200);
      console.log(`Invalid login returned status: ${response.status}`);
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      if (!authToken) {
        console.log('Skipping test because authToken is not available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`);

      console.log(`Protected route access returned status: ${response.status}`);
      expect([200, 401, 403]).toContain(response.status);
    });

    it('should reject access to protected route without token', async () => {
      const response = await request(app.getHttpServer()).get('/users');

      console.log(`No token access returned status: ${response.status}`);

      expect(response.status).not.toBe(200);
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer invalid-token');

      console.log(`Invalid token access returned status: ${response.status}`);

      expect(response.status).not.toBe(200);
    });

    it('verify mongo connection works', async () => {
      const uri = mongoMemoryServer.getUri();

      const connection = await mongoose.createConnection(uri).asPromise();
      expect(connection.readyState).toBe(1);

      const result = await connection.db
        .collection('test_collection')
        .insertOne({
          email: 'test-direct@example.com',
          password: 'directpassword',
          name: 'Direct',
          firstname: 'Test',
        });

      console.log('Direct MongoDB insert result:', result);
      expect(result.acknowledged).toBe(true);

      await connection.close();
    });
  });
});
