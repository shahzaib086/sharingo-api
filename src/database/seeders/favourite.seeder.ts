import { DataSource } from 'typeorm';
import { Favourite, FavouriteType } from '../../entities/favourite.entity';

export class FavouriteSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Favourite);

    try {
      // Clear existing data
      await this.dataSource.query('TRUNCATE TABLE favourites RESTART IDENTITY CASCADE');

      const favourites = [
        {
          userId: 1,
          type: FavouriteType.VIDEO,
          videoId: 1,
          productId: null as any,
        },
        {
          userId: 1,
          type: FavouriteType.VIDEO,
          videoId: 2,
          productId: null as any,
        },
        {
          userId: 1,
          type: FavouriteType.PRODUCT,
          videoId: null as any,
          productId: 1,
        },
        {
          userId: 1,
          type: FavouriteType.PRODUCT,
          videoId: null as any,
          productId: 2,
        },
        {
          userId: 2,
          type: FavouriteType.VIDEO,
          videoId: 3,
          productId: null as any,
        },
        {
          userId: 2,
          type: FavouriteType.PRODUCT,
          videoId: null as any,
          productId: 3,
        },
      ];

      for (const favourite of favourites) {
        const newFavourite = repository.create(favourite as any);
        await repository.save(newFavourite);
      }

      console.log('✅ Favourites seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding favourites:', error);
      throw error;
    }
  }
} 