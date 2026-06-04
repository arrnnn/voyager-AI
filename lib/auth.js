import { auth } from '@clerk/nextjs/server';
import { db } from './db';

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return db.user.findUnique({ where: { clerkId: userId } });
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}