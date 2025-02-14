import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { Role, RoleDocument } from '../roles/roles.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    private jwtService: JwtService,
  ) {}

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).populate('role').exec();
  }

  async create(user: Partial<User>): Promise<UserDocument> {
    const existingUser = await this.findOneByEmail(user.email);
    if (existingUser) {
      throw new ConflictException("Email d'utilisateur déjà pris");
    }

    if (!this.isValidName(user.name)) {
      throw new BadRequestException('Nom invalide');
    }
    if (!this.isValidName(user.firstname)) {
      throw new BadRequestException('Prénom invalide');
    }
    if (!this.isValidPassword(user.password)) {
      throw new BadRequestException(
        'Le mot de passe doit contenir au moins 6 caractères.',
      );
    }
    if (!this.isValidEmail(user.email)) {
      throw new BadRequestException('Email invalide');
    }
    if (this.isUnderage(user.birthDate)) {
      throw new BadRequestException("L'utilisateur doit avoir au moins 18 ans");
    }

    if (!this.isValidName(user.city)) {
      throw new BadRequestException('Ville invalide');
    }
    if (!this.isValidZipcode(user.zipcode)) {
      throw new BadRequestException('Code postal invalide');
    }
    const defaultRole = await this.roleModel.findOne({ name: 'employee' });
    if (!defaultRole) {
      throw new NotFoundException(
        'Le rôle "employee" par défaut est introuvable',
      );
    }

    user.role = defaultRole._id as Types.ObjectId;
    user.password = await bcrypt.hash(user.password, 10);

    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async remove(id: string, token: string): Promise<void> {
    // const usertodelete = await this.findById(id);
    const decodedToken = await this.jwtService.decode(token);
    if (decodedToken.role.name !== 'admin') {
      throw new ForbiddenException(
        'Vous devez être un administrateur pour supprimer cet utilisateur.',
      );
    }

    if (!decodedToken.role.permissions.includes('delete')) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de supprimer cet utilisateur.",
      );
    }

    await this.userModel.deleteOne({ _id: id });
  }

  // Méthodes de validation privées
  private isUnderage(birthDate: Date): boolean {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age < 18;
  }

  private isValidPassword(password: string): boolean {
    return password && password.length >= 6;
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  private isValidName(name: string): boolean {
    const namePattern = /^[A-Za-zÀ-ÿ'-]+(?:\s[A-Za-zÀ-ÿ'-]+)*$/; // Allow letters, spaces, apostrophes, dashes
    return namePattern.test(name);
  }

  private isValidZipcode(zipcode: string): boolean {
    const zipcodePattern = /^[0-9]{5}$/;
    return zipcodePattern.test(zipcode);
  }
}
