'use client';

import { useAppStore } from '@/store/useAppStore';

export function MobileMenuButton() {
  const { isMobileMenuOpen, toggleMobileMenu } = useAppStore();

  return (
    <button
      onClick={toggleMobileMenu}
      aria-label="Menu de navegação"
      aria-expanded={isMobileMenuOpen}
      className="fixed top-3 left-3 z-50 lg:hidden p-2.5 rounded-xl bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm active:scale-95"
    >
      <span className="material-symbols-outlined text-xl text-gray-700 dark:text-gray-300">menu</span>
    </button>
  );
}
