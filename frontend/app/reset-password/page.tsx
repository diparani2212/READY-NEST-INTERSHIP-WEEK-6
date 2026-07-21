'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Activity, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { resetPasswordApi } from '@/lib/auth';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = searchParams.get('userId') || '';
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!userId || !token) {
      setError('Invalid or missing password reset link. Please request a new one.');
    }
  }, [userId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordApi({
        userId,
        token,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to reset password. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-2xl border border-slate-700/60 sm:px-10">
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-800/80 p-3 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate-300">
            Your password has been successfully reset! You can now sign in with your new password.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300">
              New Password
            </label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
              Confirm New Password
            </label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !userId || !token}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Resetting Password...
                </>
              ) : (
                'Set New Password'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-900 py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-lg shadow-blue-500/30 text-white">
            <Activity className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            CityCare Hospital
          </span>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-slate-100">
          Create New Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Enter your new account password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <Suspense fallback={<div className="text-center text-slate-400">Loading reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
