import { db } from './index.ts';
import { categories, products, banners } from './schema.ts';

async function seed() {
  console.log('Seeding database...');
  
  // Truncate tables (Note: This will fail if there are orders referencing products. Use update-data.ts instead for live updates).
  await db.delete(products).catch(() => console.log('Products could not be deleted due to FK constraints.'));
  await db.delete(categories).catch(() => console.log('Categories could not be deleted.'));
  await db.delete(banners);

  const [fruitsCat] = await db.insert(categories).values({ name: 'Fruits & Veg', icon_url: 'Apple' }).returning();
  const [dairyCat] = await db.insert(categories).values({ name: 'Dairy & Eggs', icon_url: 'Milk' }).returning();
  const [snacksCat] = await db.insert(categories).values({ name: 'Snacks', icon_url: 'Cookie' }).returning();

  await db.insert(products).values([
    { name: 'Apple Royal Gala', categoryId: fruitsCat.id, price: 129, unit: '1 kg', image_url: 'https://loremflickr.com/500/500/apple,fruit?lock=10' },
    { name: 'Banana', categoryId: fruitsCat.id, price: 52, unit: '1 kg', image_url: 'https://loremflickr.com/500/500/banana,fruit?lock=11' },
    { name: 'Amul Taaza Milk', categoryId: dairyCat.id, price: 61, unit: '1 L', image_url: 'https://loremflickr.com/500/500/milk,glass?lock=12' },
    { name: 'Lay\'s Classic Salted', categoryId: snacksCat.id, price: 20, unit: '52 g', image_url: 'https://loremflickr.com/500/500/potato,chips?lock=13' }
  ]).catch(() => console.log('Seed products not inserted (already exist)'));
  
  await db.insert(banners).values([
    { image_url: 'https://loremflickr.com/800/400/supermarket,store?lock=1', display_order: 1 },
    { image_url: 'https://loremflickr.com/800/400/grocery,vegetables?lock=2', display_order: 2 },
    { image_url: 'https://loremflickr.com/800/400/fresh,food?lock=3', display_order: 3 },
  ]);
  
  console.log('Seeding complete.');
}

seed().catch(console.error).finally(() => process.exit(0));
