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
        // Core consumer categories
        { name: 'Electronics', description: 'Electronic devices and gadgets', status: 1 },
        { name: 'Mobile Phones', description: 'Smartphones and mobile accessories', status: 1 },
        { name: 'Computers', description: 'Computer hardware, software, and accessories', status: 1 },
        { name: 'Home Appliances', description: 'Home and household appliances', status: 1 },
        { name: 'Furniture', description: 'Indoor and outdoor furniture', status: 1 },
        { name: 'Books', description: 'Books, novels, and educational materials', status: 1 },
        { name: 'Stationery', description: 'Office and school supplies', status: 1 },
        { name: 'Clothing', description: 'Men, women, and kids clothing', status: 1 },
        { name: 'Footwear', description: 'Shoes, sandals, and other footwear', status: 1 },
        { name: 'Accessories', description: 'Bags, belts, wallets, and fashion accessories', status: 1 },
        { name: 'Beauty & Personal Care', description: 'Cosmetics, skincare, and grooming products', status: 1 },
        { name: 'Health & Wellness', description: 'Healthcare, supplements, and wellness products', status: 1 },
        { name: 'Food & Beverages', description: 'Groceries, snacks, and drinks', status: 1 },
        { name: 'Baby & Kids', description: 'Toys, clothing, and accessories for babies and children', status: 1 },
        { name: 'Toys & Games', description: 'Games, puzzles, and toys for all ages', status: 1 },
        { name: 'Sports & Outdoors', description: 'Sports equipment, fitness gear, and outdoor items', status: 1 },
        { name: 'Automotive', description: 'Automotive parts, tools, and accessories', status: 1 },
        { name: 'Home & Kitchen', description: 'Kitchen tools, cookware, and household items', status: 1 },
        { name: 'Garden & Outdoor', description: 'Garden tools, furniture, and décor', status: 1 },
        { name: 'Pet Supplies', description: 'Pet food, toys, and accessories', status: 1 },
        { name: 'Jewelry & Watches', description: 'Jewelry items, watches, and related accessories', status: 1 },
        { name: 'Music & Instruments', description: 'Musical instruments and accessories', status: 1 },
        { name: 'Art & Craft', description: 'Art supplies, materials, and creative items', status: 1 },
        { name: 'Movies & Entertainment', description: 'DVDs, CDs, and entertainment content', status: 1 },
        { name: 'Industrial & Scientific', description: 'Industrial equipment, tools, and lab supplies', status: 1 },
        { name: 'Travel & Luggage', description: 'Bags, luggage, and travel accessories', status: 1 },
        { name: 'Office Supplies', description: 'Office furniture, stationery, and productivity tools', status: 1 },
        { name: 'Real Estate', description: 'Property listings and related services', status: 1 },
        { name: 'Digital Products', description: 'Software, apps, and digital goods', status: 1 },
        { name: 'Gaming', description: 'Video games, consoles, and accessories', status: 1 },
        { name: 'Collectibles', description: 'Antiques, memorabilia, and collector’s items', status: 1 },
        { name: 'Safety & Security', description: 'Safety gear and security systems', status: 1 },
        { name: 'Services', description: 'Professional and personal services', status: 1 },
        { name: 'Other', description: 'Items that do not fit in any other category', status: 1 },
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
