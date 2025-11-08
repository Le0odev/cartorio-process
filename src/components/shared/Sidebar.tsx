'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/useAppStore';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
  },
  {
    name: 'Processos',
    href: '/processos',
    icon: 'folder',
  },
  {
    name: 'Clientes',
    href: '/clientes',
    icon: 'group',
  },
  {
    name: 'Relatórios',
    href: '/relatorios',
    icon: 'bar_chart',
  },
  {
    name: 'Configurações',
    href: '/configuracoes',
    icon: 'settings',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isMobileMenuOpen, closeMobileMenu } = useAppStore();

  const handleLogout = async () => {
    closeMobileMenu();
    await logout();
  };

  const handleLinkClick = () => {
    closeMobileMenu();
  };

  // Subtask 3.4: Implementar listener de resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen, closeMobileMenu]);

  // Subtask 3.5: Prevenir scroll do body com menu aberto
  useEffect(() => {
    if (isMobileMenuOpen && window.innerWidth < 1024) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

  // Subtask 5: Adicionar suporte a teclado (ESC para fechar)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen && window.innerWidth < 1024) {
        closeMobileMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <>
      {/* Subtask 3.2: Implementar overlay para mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Subtask 3.1: Adicionar classes Tailwind para responsividade */}
      <aside
        className={cn(
          'flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark p-4',
          // Desktop: sempre visível e relative
          'lg:relative lg:translate-x-0',
          // Mobile: fixed, fora da tela por padrão, com transição
          'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80")`
            }}
          />
          <div className="flex flex-col">
            <h1 className="text-gray-900 dark:text-white text-base font-medium leading-normal">
              {user?.displayName || 'Ana Costa'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
              Administrador
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-2 mt-6 flex-grow">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium leading-normal transition-colors',
                isActive
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <p>{item.name}</p>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-gray-200 dark:border-gray-800 pt-4">
        <Link
          href="/ajuda"
          onClick={handleLinkClick}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <span className="material-symbols-outlined">help</span>
          <p className="text-sm font-medium leading-normal">Ajuda</p>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 w-full text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          <p className="text-sm font-medium leading-normal">Sair</p>
        </button>
      </div>
    </aside>
    </>
  );
}