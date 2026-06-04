const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const user = await db.user.findFirst();
  if (!user) {
    console.log('No user found. Please sign in first.');
    return;
  }

  await db.subscription.upsert({
    where: { userId: user.id },
    update: { plan: 'pro', status: 'active' },
    create: {
      userId: user.id,
      plan: 'pro',
      status: 'active',
    },
  });

  console.log('User upgraded to Pro:', user.email);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());