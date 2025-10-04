import { DataSource } from 'typeorm';
import { Video } from '../../entities/video.entity';

export class VideoSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run() {
    const videoRepository = this.dataSource.getRepository(Video);

    // Truncate the videos table before seeding
    await videoRepository.query(`TRUNCATE TABLE videos CASCADE`);
    console.log('✅ Videos table truncated successfully');

    const videos = [
      {
        videoUrl: 'https://example.com/videos/motivation-video-1.mp4',
        thumbnailUrl: 'https://example.com/thumbnails/motivation-thumb-1.jpg',
        title: 'The Power of Positive Thinking',
        shortDescription: 'Learn how positive thinking can transform your life',
        description: 'This video explores the science behind positive thinking and how it can help you achieve your goals. Discover practical techniques to cultivate a positive mindset and overcome challenges.',
        categoryId: 1, // Motivation
        tags: 'motivation,positive thinking,self-improvement',
        status: 1,
      },
      {
        videoUrl: 'https://example.com/videos/education-video-1.mp4',
        thumbnailUrl: 'https://example.com/thumbnails/education-thumb-1.jpg',
        title: 'Introduction to Mindfulness',
        shortDescription: 'A beginner\'s guide to mindfulness meditation',
        description: 'Learn the basics of mindfulness meditation and how to incorporate it into your daily routine. This video covers breathing techniques, body scanning, and mindful awareness.',
        categoryId: 2, // Education
        tags: 'mindfulness,meditation,wellness',
        status: 1,
      },
      {
        videoUrl: 'https://example.com/videos/entertainment-video-1.mp4',
        thumbnailUrl: 'https://example.com/thumbnails/entertainment-thumb-1.jpg',
        title: 'Fun Science Experiments',
        shortDescription: 'Amazing science experiments you can do at home',
        description: 'Discover fascinating science experiments that you can safely perform at home. Learn about chemical reactions, physics principles, and have fun while learning.',
        categoryId: 3, // Entertainment
        tags: 'science,experiments,fun,learning',
        status: 1,
      },
      {
        videoUrl: 'https://example.com/videos/health-video-1.mp4',
        thumbnailUrl: 'https://example.com/thumbnails/health-thumb-1.jpg',
        title: 'Morning Yoga Routine',
        shortDescription: 'Start your day with this energizing yoga sequence',
        description: 'This 15-minute morning yoga routine will help you wake up, stretch your body, and set a positive tone for your day. Perfect for beginners and experienced practitioners alike.',
        categoryId: 4, // Health & Wellness
        tags: 'yoga,morning routine,health,wellness',
        status: 1,
      },
      {
        videoUrl: 'https://example.com/videos/tech-video-1.mp4',
        thumbnailUrl: 'https://example.com/thumbnails/tech-thumb-1.jpg',
        title: 'Understanding AI Basics',
        shortDescription: 'A simple explanation of artificial intelligence',
        description: 'This video breaks down the complex world of artificial intelligence into simple, understandable concepts. Learn about machine learning, neural networks, and how AI is shaping our future.',
        categoryId: 5, // Technology
        tags: 'artificial intelligence,technology,machine learning',
        status: 1,
      },
    ];

    try {
      await videoRepository.save(videos);
      console.log(`✅ Seeded ${videos.length} videos successfully`);
    } catch (error) {
      console.error('❌ Error seeding videos:', error);
      throw error;
    }
  }
} 