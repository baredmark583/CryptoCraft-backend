"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../../data-source");
const user_entity_1 = require("../users/entities/user.entity");
const category_entity_1 = require("../categories/entities/category.entity");
async function run() {
    const ds = await data_source_1.default.initialize();
    try {
        const userRepo = ds.getRepository(user_entity_1.User);
        const categoryRepo = ds.getRepository(category_entity_1.Category);
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
                role: 'SUPER_ADMIN',
            });
            await userRepo.save(admin);
        }
        const baseCategories = ['Электроника', 'Товары ручной работы', 'Ювелирные изделия'];
        for (const name of baseCategories) {
            const exists = await categoryRepo.findOne({ where: { name } });
            if (!exists) {
                await categoryRepo.save(categoryRepo.create({ name, fields: [] }));
            }
        }
        console.log('Seeding completed');
    }
    finally {
        await ds.destroy();
    }
}
run().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map