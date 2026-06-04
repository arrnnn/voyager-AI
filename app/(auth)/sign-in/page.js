'use client';

import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';

export default function SignInPage() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    if (!isLoaded) return;
    sessionStorage.clear();
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err) {
      setError('Failed to sign in with Google');
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    sessionStorage.clear();
    try {
      await signIn.create({
        strategy: 'email_code',
        identifier: email,
      });
      setShowCode(true);
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Failed to send code. Check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/dashboard';
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
          <span className="text-xl font-bold text-white">Voyager AI</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {showCode ? 'Check your email' : 'Welcome back'}
        </h1>
        <p className="text-zinc-400 text-sm">
          {showCode ? `Code sent to ${email}` : 'Sign in to continue planning your journey'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      {!showCode && (
        <div>
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-xl transition mb-4 text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="text-zinc-500 text-xs">or sign in with email</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl transition text-sm"
            >
              {loading ? 'Sending code...' : 'Send Sign In Code'}
            </button>
          </form>
        </div>
      )}

      {showCode && (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Enter the 6-digit code
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="123456"
              required
              maxLength={6}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition text-center text-2xl tracking-widest"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl transition text-sm"
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => { setShowCode(false); setCode(''); setError(''); }}
            className="w-full py-2 text-zinc-400 hover:text-white text-sm transition"
          >
            Use different email
          </button>
        </form>
      )}

      <p className="text-center text-zinc-500 text-sm mt-6">
        No account?{' '}
        <Link href="/sign-up" className="text-blue-400 hover:underline">Create one free</Link>
      </p>
    </div>
  );
}