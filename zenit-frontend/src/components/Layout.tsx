// zenit-frontend/src/components/Layout.tsx
import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

// Ícones (pode usar heroicons, react-icons, etc.)
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const AccountsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const TransactionsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const CategoriesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Definir links de navegação com ícones
  const navLinks = [
    { href: '/', label: 'Dashboard', icon: <HomeIcon /> },
    { href: '/financial-accounts', label: 'Contas', icon: <AccountsIcon /> },
    { href: '/financial-transactions', label: 'Transações', icon: <TransactionsIcon /> },
    { href: '/financial-categories', label: 'Categorias', icon: <CategoriesIcon /> },
    { href: '/reports', label: 'Relatórios', icon: <ReportsIcon /> },
  ];

  // Links de administração, visíveis apenas para ADMIN e SUPERUSER
  const adminLinks = [
    { href: '/users', label: 'Usuários', icon: <UsersIcon /> },
    { href: '/settings', label: 'Configurações', icon: <SettingsIcon /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Barra superior */}
      <header className="bg-white shadow-sm z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <span className="text-2xl font-bold text-primary">Zenit</span>
                </Link>
              </div>
              
              {/* Menu de hambúrguer mobile */}
              <button
                className="lg:hidden ml-4 p-2 rounded-md text-neutral-600 hover:text-primary focus:outline-none"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Título da página atual */}
              <h1 className="ml-4 text-xl font-heading font-semibold text-neutral-800">
                {title}
              </h1>
            </div>
            
            {/* Perfil do usuário */}
            <div className="flex items-center">
              <div className="hidden sm:flex sm:items-center sm:ml-6">
                <div className="text-sm text-neutral-700 mr-4">
                  {user?.role}
                </div>
                
                <button
                  onClick={logout}
                  className="flex items-center text-neutral-600 hover:text-primary p-2"
                >
                  <LogoutIcon />
                  <span className="ml-2">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal com sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block bg-white w-64 border-r border-neutral-200">
          <div className="h-full overflow-y-auto py-4">
            <nav className="px-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    router.pathname === link.href
                      ? 'bg-primary-light/10 text-primary'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              
              {/* Seção de administração */}
              {(user?.role === 'ADMIN' || user?.role === 'SUPERUSER') && (
                <>
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <h3 className="px-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Administração
                    </h3>
                    <div className="mt-2 space-y-1">
                      {adminLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                            router.pathname === link.href
                              ? 'bg-primary-light/10 text-primary'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          <span className="mr-3">{link.icon}</span>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Sidebar Mobile (Overlay) */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            {/* Overlay de fundo */}
            <div
              className="fixed inset-0 bg-neutral-800/50"
              onClick={() => setMobileSidebarOpen(false)}
            ></div>
            
            {/* Sidebar slide-over */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="flex-1 h-0 overflow-y-auto pt-5 pb-4">
                <div className="flex-shrink-0 flex items-center px-4">
                  <span className="text-2xl font-bold text-primary">Zenit</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                        router.pathname === link.href
                          ? 'bg-primary-light/10 text-primary'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                  
                  {/* Seção de administração */}
                  {(user?.role === 'ADMIN' || user?.role === 'SUPERUSER') && (
                    <>
                      <div className="mt-6 pt-6 border-t border-neutral-200">
                        <h3 className="px-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Administração
                        </h3>
                        <div className="mt-2 space-y-1">
                          {adminLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                                router.pathname === link.href
                                  ? 'bg-primary-light/10 text-primary'
                                  : 'text-neutral-600 hover:bg-neutral-100'
                              }`}
                              onClick={() => setMobileSidebarOpen(false)}
                            >
                              <span className="mr-3">{link.icon}</span>
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </nav>
              </div>
              
              {/* Rodapé do sidebar mobile */}
              <div className="flex-shrink-0 flex border-t border-neutral-200 p-4">
                <button
                  onClick={logout}
                  className="flex items-center text-neutral-600 hover:text-primary p-2 w-full"
                >
                  <LogoutIcon />
                  <span className="ml-2">Sair</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}