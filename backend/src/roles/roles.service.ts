import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './roles.schema';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  async seedRoles() {
    const count = await this.roleModel.estimatedDocumentCount();

    if (count === 0) {
      console.log('Seeding default roles...');

      await this.roleModel.create([
        {
          name: 'employee',
          permissions: ['read'],
        },
        {
          name: 'admin',
          permissions: ['read', 'write', 'delete', 'admin'],
        },
      ]);

      console.log('Default roles created successfully');
    } else {
      console.log('Roles already exist, skipping seed');
    }
  }

  async findByName(name: string): Promise<RoleDocument> {
    return this.roleModel.findOne({ name }).exec();
  }

  async findAll(): Promise<RoleDocument[]> {
    return this.roleModel.find().exec();
  }
}
