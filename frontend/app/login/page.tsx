'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Mail, Lock, Eye, EyeOff, ShieldCheck, UserCheck, Stethoscope, AlertCircle, Loader2 } from 'lucide-react';
import { loginApi } from '@/lib/auth';

type RoleType = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleType>('PATIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginApi({ email, password, role });
      if (res.success) {
        // Role-based redirect
        if (role === 'PATIENT') {
          router.push('/patient/dashboard');
        } else if (role === 'DOCTOR') {
          router.push('/doctor/dashboard');
        } else if (role === 'ADMIN') {
          router.push('/admin/dashboard');
        }
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-900 py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-75"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Hospital Logo & Title */}
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-lg shadow-blue-500/30 text-white">
            <Activity className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            CityCare Hospital
          </span>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-slate-100">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Smart Hospital Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-2xl border border-slate-700/60 sm:px-10">
          
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Login Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-700/50">
              <button
                type="button"
                id="role-patient-tab"
                onClick={() => setRole('PATIENT')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  role === 'PATIENT'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Patient
              </button>
              <button
                type="button"
                id="role-doctor-tab"
                onClick={() => setRole('DOCTOR')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  role === 'DOCTOR'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                Doctor
              </button>
              <button
                type="button"
                id="role-admin-tab"
                onClick={() => setRole('ADMIN')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  role === 'ADMIN'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-800/80 p-3 text-sm text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-700 bg-slate-900 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-slate-400 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div>
                <Link
                  href="/forgot-password"
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                id="login-submit-button"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Signing in...
                  </>
                ) : (
                  `Sign in as ${role.charAt(0) + role.slice(1).toLowerCase()}`
                )}
              </button>
            </div>
          </form>

          {/* Signup Link for Patients */}
          {role === 'PATIENT' && (
            <div className="mt-6 text-center text-sm text-slate-400">
              Don't have a patient account?{' '}
              <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300">
                Register here
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
