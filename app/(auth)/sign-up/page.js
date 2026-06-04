'use client';

import { useSignUp } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
  const { signUp, isLoaded } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('form');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Something went wrong');
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
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!isLoaded) return;
    await signUp.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/dashboard',
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-zinc-400 text-sm">Start planning trips with AI</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {step === 'form' && (
          <>
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
              <span className="text-zinc-500 text-xs">or</span>
              <div className="flex-1 h-px bg-zinc-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl transition text-sm"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-zinc-300 text-sm">We sent a verification code to</p>
              <p className="text-white font-semibold">{email}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500 transition text-center text-lg tracking-widest"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl transition text-sm"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full py-2 text-zinc-400 hover:text-white text-sm transition"
            >
              Back
            </button>
          </form>
        )}

        <p className="text-center text-zinc-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-blue-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}