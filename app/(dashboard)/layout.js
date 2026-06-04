import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }) {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const clerkUser = await currentUser();

  await db.user.upsert({
    where: { clerkId: userId },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      image: clerkUser.imageUrl,
    },
    create: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      image: clerkUser.imageUrl,
    },
  });

  return (
    <>
      <style>{`
        .dash-main {
          margin-left: 256px;
          flex: 1;
          min-height: 100vh;
          background: transparent;
        }
        @media (max-width: 768px) {
          .dash-main {
            margin-left: 0;
          }
        }
      `}</style>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main className="dash-main">
          {children}
        </main>
      </div>
    </>
  );
}