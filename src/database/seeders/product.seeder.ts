import { DataSource } from 'typeorm';
import { Product } from '../../entities/product.entity';

export class ProductSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Product);

    try {
      // Clear existing data
      await this.dataSource.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');

      const products = [
        {
          name: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          publishedDate: new Date('1925-04-10'),
          categoryId: 1, // Fiction
          price: 12.99,
          image: 'uploads/products/gatsby.jpg',
          inventory: 50,
          description: 'A classic American novel about the Jazz Age and the American Dream.',
          status: 1,
          averageRating: 4.5,
        },
        {
          name: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          publishedDate: new Date('1960-07-11'),
          categoryId: 1, // Fiction
          price: 14.99,
          image: 'uploads/products/mockingbird.jpg',
          inventory: 75,
          description: 'A powerful story about racial injustice and moral growth.',
          status: 1,
          averageRating: 4.8,
        },
        {
          name: 'The Art of War',
          author: 'Sun Tzu',
          publishedDate: new Date('1999-01-01'),
          categoryId: 2, // Non-Fiction
          price: 9.99,
          image: 'uploads/products/art-of-war.jpg',
          inventory: 100,
          description: 'Ancient Chinese text on military strategy and tactics.',
          status: 1,
          averageRating: 4.2,
        },
        {
          name: 'Sapiens: A Brief History of Humankind',
          author: 'Yuval Noah Harari',
          publishedDate: new Date('2011-01-01'),
          categoryId: 2, // Non-Fiction
          price: 19.99,
          image: 'uploads/products/sapiens.jpg',
          inventory: 60,
          description: 'A groundbreaking narrative of humanity\'s creation and evolution.',
          status: 1,
          averageRating: 4.6,
        },
        {
          name: 'The Innovators',
          author: 'Walter Isaacson',
          publishedDate: new Date('2014-10-07'),
          categoryId: 3, // Science & Technology
          price: 16.99,
          image: 'uploads/products/innovators.jpg',
          inventory: 40,
          description: 'The story of the people who created the computer and the internet.',
          status: 1,
          averageRating: 4.3,
        },
        {
          name: 'The Lean Startup',
          author: 'Eric Ries',
          publishedDate: new Date('2011-09-13'),
          categoryId: 4, // Business & Finance
          price: 18.99,
          image: 'uploads/products/lean-startup.jpg',
          inventory: 55,
          description: 'How today\'s entrepreneurs use continuous innovation to create radically successful businesses.',
          status: 1,
          averageRating: 4.4,
        },
        {
          name: 'Atomic Habits',
          author: 'James Clear',
          publishedDate: new Date('2018-10-16'),
          categoryId: 5, // Self-Help
          price: 15.99,
          image: 'uploads/products/atomic-habits.jpg',
          inventory: 80,
          description: 'Tiny changes, remarkable results: An easy & proven way to build good habits & break bad ones.',
          status: 1,
          averageRating: 4.7,
        },
        {
          name: 'Steve Jobs',
          author: 'Walter Isaacson',
          publishedDate: new Date('2011-10-24'),
          categoryId: 6, // Biography & Memoir
          price: 17.99,
          image: 'uploads/products/steve-jobs.jpg',
          inventory: 45,
          description: 'The exclusive biography of Steve Jobs, the co-founder of Apple.',
          status: 1,
          averageRating: 4.5,
        },
        {
          name: 'Guns, Germs, and Steel',
          author: 'Jared Diamond',
          publishedDate: new Date('1997-03-01'),
          categoryId: 7, // History
          price: 13.99,
          image: 'uploads/products/guns-germs-steel.jpg',
          inventory: 70,
          description: 'The fates of human societies and the rise of civilization.',
          status: 1,
          averageRating: 4.1,
        },
        {
          name: 'Meditations',
          author: 'Marcus Aurelius',
          publishedDate: new Date('1880-01-01'),
          categoryId: 8, // Philosophy
          price: 11.99,
          image: 'uploads/products/meditations.jpg',
          inventory: 65,
          description: 'Personal writings of the Roman Emperor on Stoic philosophy.',
          status: 1,
          averageRating: 4.3,
        },
      ];

      for (const product of products) {
        const newProduct = repository.create(product);
        await repository.save(newProduct);
      }

      console.log('✅ Products seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding products:', error);
      throw error;
    }
  }
} 