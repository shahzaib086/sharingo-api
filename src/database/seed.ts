import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { DatabaseSeeder } from './seeders';
import { User } from '../entities/user.entity';
import { Faq } from '../entities/faq.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { Product } from '../entities/product.entity';
import { Content } from '../entities/content.entity';
import { Notification } from '../entities/notification.entity';
import { Address } from '../entities/address.entity';
import { ProductMedia } from '../entities/product-media.entity';

// Load environment variables from .env file
config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_POOL || 'sharingo_db',
    entities: [User, Faq, ProductCategory, Product, Content, Notification, Address, ProductMedia],
    synchronize: false, // Don't auto-sync in production
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('📦 Database connection established');

    const seeder = new DatabaseSeeder(dataSource);
    await seeder.run();

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Run the seeder
seed(); 