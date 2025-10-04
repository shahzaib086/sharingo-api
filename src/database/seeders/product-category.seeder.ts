import { DataSource } from 'typeorm';
import { ProductCategory } from '../../entities/product-category.entity';

export class ProductCategorySeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(ProductCategory);

    try {
      // Clear existing data
      await this.dataSource.query('TRUNCATE TABLE product_categories RESTART IDENTITY CASCADE');

      const categories = [
        {
          name: 'Fiction',
          description: 'Fictional literature and novels',
          status: 1,
        },
        {
          name: 'Non-Fiction',
          description: 'Non-fictional books and educational content',
          status: 1,
        },
        {
          name: 'Science & Technology',
          description: 'Books about science, technology, and innovation',
          status: 1,
        },
        {
          name: 'Business & Finance',
          description: 'Business, finance, and management books',
          status: 1,
        },
        {
          name: 'Self-Help',
          description: 'Personal development and self-help books',
          status: 1,
        },
        {
          name: 'Biography & Memoir',
          description: 'Biographies and personal memoirs',
          status: 1,
        },
        {
          name: 'History',
          description: 'Historical books and accounts',
          status: 1,
        },
        {
          name: 'Philosophy',
          description: 'Philosophical works and theories',
          status: 1,
        },
      ];

      for (const category of categories) {
        const newCategory = repository.create(category);
        await repository.save(newCategory);
      }

      console.log('✅ Product categories seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding product categories:', error);
      throw error;
    }
  }
} 