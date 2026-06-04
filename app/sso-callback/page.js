'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    sessionStorage.clear();
    handleRedirectCallback({
      afterSignInUrl: '/dashboard',
      afterSignUpUrl: '/dashboard',
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-zinc-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Signing you in...</p>
      </div>
    </div>
  );
}