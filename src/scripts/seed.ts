import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dataSource from '../../data-source';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';

async function run() {
  const ds: DataSource = await dataSource.initialize();
  try {
    const userRepo = ds.getRepository(User);
    const categoryRepo = ds.getRepository(Category);

    // Admin placeholder (only if not exists)
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin';
    let admin = await userRepo.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = userRepo.create({
        email: adminEmail,
        name: 'Administrator',
        avatarUrl: 'default_avatar_url',
        rating: 0,
        following: [],
        balance: 0,
        commissionOwed: 0,
        role: 'SUPER_ADMIN' as any,
      });
      await userRepo.save(admin);
    }

    // Basic categories
    const baseCategories = ['Электроника', 'Товары ручной работы', 'Ювелирные изделия'];
    for (const name of baseCategories) {
      const exists = await categoryRepo.findOne({ where: { name } });
      if (!exists) {
        await categoryRepo.save(categoryRepo.create({ name, fields: [] }));
      }
    }

    console.log('Seeding completed');
  } finally {
    await ds.destroy();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


