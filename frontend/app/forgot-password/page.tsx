'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { forgotPasswordApi } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ message: string; resetUrl?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessData(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await forgotPasswordApi({ email });
      if (res.success) {
        setSuccessData({
          message: res.message,
          resetUrl: res.data?.resetUrl,
        });
      } else {
        setError(res.message || 'Failed to process password reset request.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

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
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Enter your email and we'll send you a password reset link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-2xl border border-slate-700/60 sm:px-10">
          
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-800/80 p-3 text-sm text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successData ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-300">{successData.message}</p>

              {successData.resetUrl && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs text-left overflow-x-auto">
                  <span className="font-semibold text-slate-400">Dev Reset Link:</span>
                  <a
                    href={successData.resetUrl}
                    className="block text-blue-400 hover:underline mt-1 break-all"
                  >
                    {successData.resetUrl}
                  </a>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300"
                >
                  <ArrowLeft className="h-4 w-4" /> Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Registered Email Address
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
