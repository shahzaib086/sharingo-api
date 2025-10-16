import { DataSource } from 'typeorm';
import { FaqSeeder } from './faq.seeder';
import { ProductCategorySeeder } from './product-category.seeder';

export class DatabaseSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run() {
    console.log('🌱 Starting database seeding...');
    try {
      // const faqSeeder = new FaqSeeder(this.dataSource);
      // await faqSeeder.run();

      const productCategorySeeder = new ProductCategorySeeder(this.dataSource);
      await productCategorySeeder.run();

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
} 