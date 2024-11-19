import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Créer un utilisateur
  async create(user: Partial<User>): Promise<User> {
    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  // Récupérer tous les utilisateurs
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}