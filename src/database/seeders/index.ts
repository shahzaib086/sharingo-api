import { DataSource } from 'typeorm';
import { FaqSeeder } from './faq.seeder';
import { QuestionSeeder } from './question.seeder';
import { ContentSeeder } from './content.seeder';
import { VideoCategorySeeder } from './video-category.seeder';
import { VideoSeeder } from './video.seeder';
import { ProductCategorySeeder } from './product-category.seeder';
import { ProductSeeder } from './product.seeder';
import { FavouriteSeeder } from './favourite.seeder';
import { orderSeeder } from './order.seeder';

export class DatabaseSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run() {
    console.log('🌱 Starting database seeding...');
    try {
      // const faqSeeder = new FaqSeeder(this.dataSource);
      // await faqSeeder.run();

      // const questionSeeder = new QuestionSeeder(this.dataSource);
      // await questionSeeder.run();

      // const contentSeeder = new ContentSeeder(this.dataSource);
      // await contentSeeder.run();

      // const videoCategorySeeder = new VideoCategorySeeder(this.dataSource);
      // await videoCategorySeeder.run();

      // const videoSeeder = new VideoSeeder(this.dataSource);
      // await videoSeeder.run();

      // const productCategorySeeder = new ProductCategorySeeder(this.dataSource);
      // await productCategorySeeder.run();

      // const productSeeder = new ProductSeeder(this.dataSource);
      // await productSeeder.run();

      // const favouriteSeeder = new FavouriteSeeder(this.dataSource);
      // await favouriteSeeder.run();

      // await orderSeeder(this.dataSource);

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
} 