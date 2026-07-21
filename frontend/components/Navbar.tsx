import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Hospital Logo Placeholder & Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-md shadow-blue-500/20 text-white">
            <svg
              id="hospital-logo"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 14v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m14-4V6a2 2 0 00-2-2H7a2 2 0 00-2 2v4m14 0H5m4-4v12m6-12v12"
              />
            </svg>
          </div>
          <div>
            <h1 id="hospital-name" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              CityCare Smart Hospital
            </h1>
            <p className="text-xs font-medium text-blue-600 dark:text-cyan-400">
              Management System
            </p>
          </div>
        </div>

        {/* Login Button */}
        <div>
          <button
            id="login-button-nav"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/30 transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/40 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
};
