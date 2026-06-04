const {PrismaClient} = require('@prisma/client');
const db = new PrismaClient();
db.subscription.upsert({
  where: { userId: 'cmp0zfweh0000ue6gtz1zu1lz' },
  update: { plan: 'pro', status: 'active' },
  create: { id: 'sub_pro_001', userId: 'cmp0zfweh0000ue6gtz1zu1lz', plan: 'pro', status: 'active' }
}).then(r => console.log('Done', r)).catch(console.error).finally(() => db.$disconnect());