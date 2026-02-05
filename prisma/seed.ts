import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { logger } from './logger'; // Assume you have a logger utility

const prisma = new PrismaClient();

// Types
type SeedUser = {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
};

// Sample data
const sampleUsers: Omit<SeedUser, 'id' | 'password'>[] = [
  { email: 'admin@company.com', role: 'admin' },
  { email: 'sarah.wilson@company.com', role: 'user' },
  { email: 'james.rodriguez@company.com', role: 'user' },
  { email: 'emily.chen@company.com', role: 'user' },
  { email: 'michael.patel@company.com', role: 'user' },
  { email: 'lisa.mueller@company.com', role: 'user' },
  { email: 'david.smith@company.com', role: 'admin' },
  { email: 'anna.kowalski@company.com', role: 'user' }
];

// Helper functions
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const clearExistingData = async () => {
  logger.info('Clearing existing data...');
  await prisma.user.deleteMany({});
  logger.info('Existing data cleared');
};

// Main seed function
export async function seed() {
  try {
    logger.info('Starting database seed...');

    // Optional: Clear existing data
    await clearExistingData();

    // Seed users
    logger.info('Seeding users...');
    const users = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await hashPassword('Password123!'); // In production, use proper password generation
        
        return prisma.user.create({
          data: {
            id: uuidv4(),
            email: user.email,
            password: hashedPassword,
            role: user.role
          }
        });
      })
    );

    logger.info(`Successfully seeded ${users.length} users`);
    logger.info('Database seeding completed successfully');

    return {
      users
    };
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute seed if running directly
if (require.main === module) {
  seed()
    .catch((error) => {
      logger.error('Error seeding database:', error);
      process.exit(1);
    });
}