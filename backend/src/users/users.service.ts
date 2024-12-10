import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { Role, RoleDocument } from '../roles/roles.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
    .findOne({ email })
    .populate('role')
    .exec();  }

  async create(user: Partial<User>): Promise<UserDocument> {
    const existingUser = await this.findOneByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('Email d\'utilisateur déjà pris');
    }

    const defaultRole = await this.roleModel.findOne({ name: 'employee' });
    if (!defaultRole) {
      throw new NotFoundException('Le rôle "employee" par défaut est introuvable');
    }

    user.role = defaultRole._id as Types.ObjectId;
    user.password = await bcrypt.hash(user.password, 10);

    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  // Récupérer tous les utilisateurs
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}