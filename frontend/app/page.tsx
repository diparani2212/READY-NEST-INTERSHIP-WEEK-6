import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { fetchHealthStatus } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const healthData = await fetchHealthStatus();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.100),theme(colors.slate.50))] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.950),theme(colors.slate.950))]" />
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              
              {/* Logo Placeholder */}
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-xl shadow-blue-500/25 text-white">
                <svg
                  id="hero-hospital-logo"
                  className="h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m14-4V6a2 2 0 00-2-2H7a2 2 0 00-2 2v4m14 0H5m4-4v12m6-12v12"
                  />
                </svg>
              </div>

              {/* Hospital Name Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-sm font-semibold text-blue-700 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
                CityCare Smart Hospital
              </div>

              {/* Welcome Heading */}
              <h1
                id="welcome-title"
                className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white"
              >
                Welcome to <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 bg-clip-text text-transparent">
                  Smart Hospital Management System
                </span>
              </h1>

              {/* Subheading */}
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Streamlining clinical workflows, patient care management, medical records, and hospital operations with modern intelligence.
              </p>

              {/* Actions */}
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  id="main-login-button"
                  className="rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Login to Portal
                </button>
              </div>

              {/* Health Check Card */}
              <div className="mt-16 rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    System Readiness Status
                  </h3>
                  <span
                    id="health-badge"
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      healthData?.success
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        healthData?.success ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    {healthData?.success ? 'Operational' : 'Backend Pending Connection'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Backend API:</span>{' '}
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {healthData?.service || 'Express Server (Port 5000)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Database (PostgreSQL):</span>{' '}
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {healthData?.database?.connected
                        ? 'Connected (Prisma ORM)'
                        : healthData?.database?.error || 'Ready for PostgreSQL credentials'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
