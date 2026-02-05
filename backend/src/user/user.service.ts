// user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Types
export type CreateUserDto = {
  email: string;
  password: string;
  role: 'admin' | 'user';
};

export type UpdateUserDto = Partial<Omit<CreateUserDto, 'email'>>;

export type UserFilters = {
  email?: string;
  role?: 'admin' | 'user';
};

export type PaginationParams = {
  skip?: number;
  take?: number;
};

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find all users with optional filtering and pagination
   */
  async findAll(
    filters?: UserFilters,
    pagination?: PaginationParams
  ): Promise<User[]> {
    const where: Prisma.UserWhereInput = {
      ...(filters?.email && { email: { contains: filters.email } }),
      ...(filters?.role && { role: filters.role }),
    };

    return this.prisma.user.findMany({
      where,
      skip: pagination?.skip,
      take: pagination?.take,
    });
  }

  /**
   * Find a single user by ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find a single user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Create a new user
   */
  async create(data: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        id: crypto.randomUUID(), // Generate UUID v4
      },
    });
  }

  /**
   * Update an existing user
   */
  async update(id: string, data: UpdateUserDto): Promise<User> {
    // Hash password if it's being updated
    const updateData = {
      ...data,
      ...(data.password && {
        password: await bcrypt.hash(data.password, 10),
      }),
    };

    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<User> {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }
}