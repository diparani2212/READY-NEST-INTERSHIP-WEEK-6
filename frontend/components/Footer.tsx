import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 py-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row text-center sm:text-left text-sm text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} CityCare Smart Hospital Management System. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer">Contact Support</span>
        </div>
      </div>
    </footer>
  );
};
