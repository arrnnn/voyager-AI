'use client';

import { useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/trips');
  if (isDashboard) return null;

  return (
    <nav className="bg-zinc-900/80 backdrop-blur border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={isSignedIn ? '/dashboard' : '/'} className="text-2xl font-bold text-white flex items-center gap-2">
            ✈ Voyager AI
          </Link>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-white transition">
                  Dashboard
                </Link>
                <Link href="/pricing" className="text-sm text-zinc-300 hover:text-white transition">
                  Pricing
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <Link href="/pricing" className="text-sm text-zinc-300 hover:text-white transition">
                  Pricing
                </Link>
                <Link href="/sign-in" className="text-sm text-zinc-300 hover:text-white transition">
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}