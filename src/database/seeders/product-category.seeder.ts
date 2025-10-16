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
          name: 'Electronics',
          description: 'Electronic devices and gadgets',
          status: 1,
        },
        {
          name: 'Home Appliances',
          description: 'Home and household appliances',
          status: 1,
        },
        {
          name: 'Books',
          description: 'Books and literature',
          status: 1,
        },
        {
          name: 'Kitchen',
          description: 'Kitchen tools and equipment',
          status: 1,
        },
        {
          name: 'Garden',
          description: 'Garden tools and outdoor equipment',
          status: 1,
        },
        {
          name: 'Computer',
          description: 'Computer hardware and accessories',
          status: 1,
        },
        {
          name: 'Food',
          description: 'Food items and beverages',
          status: 1,
        },
        {
          name: 'Clothing',
          description: 'Clothing and fashion items',
          status: 1,
        },
        {
          name: 'Sports',
          description: 'Sports equipment and gear',
          status: 1,
        },
        {
          name: 'Beauty',
          description: 'Beauty and personal care products',
          status: 1,
        },
        {
          name: 'Toys',
          description: 'Toys and games',
          status: 1,
        },
        {
          name: 'Automotive',
          description: 'Automotive parts and accessories',
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