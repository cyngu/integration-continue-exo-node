import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtGuard } from '../guards/jwt.guards';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: 'your-secret-key-for-testing',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard],
  exports: [JwtGuard, JwtModule],
})
export class AuthModule {}
