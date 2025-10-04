import { DataSource } from 'typeorm';
import { VideoCategory } from '../../entities/video-category.entity';

export class VideoCategorySeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run() {
    const videoCategoryRepository = this.dataSource.getRepository(VideoCategory);

    // Truncate the video_categories table before seeding
    await videoCategoryRepository.query(`TRUNCATE TABLE video_categories CASCADE`);
    console.log('✅ Video categories table truncated successfully');

    const categories = [
      {
        name: 'Motivation',
        description: 'Motivational and inspirational videos',
        status: 1,
      },
      {
        name: 'Education',
        description: 'Educational and learning videos',
        status: 1,
      },
      {
        name: 'Entertainment',
        description: 'Entertainment and fun videos',
        status: 1,
      },
      {
        name: 'Health & Wellness',
        description: 'Health and wellness related videos',
        status: 1,
      },
      {
        name: 'Technology',
        description: 'Technology and innovation videos',
        status: 1,
      },
    ];

    try {
      await videoCategoryRepository.save(categories);
      console.log(`✅ Seeded ${categories.length} video categories successfully`);
    } catch (error) {
      console.error('❌ Error seeding video categories:', error);
      throw error;
    }
  }
} 