'use client';

import { 
  Home, 
  BookOpen, 
  MessageSquare, 
  Folder, 
  MessageCircle, 
  Trophy, 
  User, 
  Settings,
  Bell,
  Search,
  Swords
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XPBar } from '../rpg/XPBar';

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();

  const NAV_LINKS = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Estudar', icon: BookOpen, href: '/study' },
    { label: 'Fórum', icon: MessageSquare, href: '/forum' },
    { label: 'Banco', icon: Folder, href: '/bank' },
    { label: 'Chat', icon: MessageCircle, href: '/chat' },
    { label: 'Ranking', icon: Trophy, href: '/ranking' },
    { label: 'Perfil', icon: User, href: '/profile' },
  ];

  const BOTTOM_NAV_LINKS = [
    { icon: Home, href: '/dashboard' },
    { icon: BookOpen, href: '/study' },
    { icon: MessageCircle, href: '/chat' },
    { icon: Folder, href: '/bank' },
    { icon: Trophy, href: '/ranking' },
  ];

  return (
    <div className="flex h-screen bg-background-base overflow-hidden font-sans">
      
      {/* SIDEBAR (Tablet 64px, Desktop 240px) */}
      <aside className="hidden md:flex flex-col border-r border-border-subtle bg-background-surface transition-all w-16 lg:w-60 z-20 shadow-sm">
        
        {/* Sidebar Logo */}
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-4 border-b border-border-subtle shrink-0 font-[family-name:var(--font-cinzel)] text-accent-primary">
          <Swords className="w-6 h-6 shrink-0" />
          <span className="hidden lg:block ml-2 text-lg font-bold uppercase tracking-widest drop-shadow-sm">StudyQuest</span>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden flex flex-col gap-1 px-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname?.startsWith(link.href) || (pathname === '/' && link.href === '/dashboard');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center group px-2 py-3 lg:px-3 rounded-lg transition-colors relative ${
                  isActive 
                    ? 'bg-accent-muted text-accent-primary font-medium' 
                    : 'text-text-secondary hover:bg-background-elevated hover:text-text-primary'
                }`}
                title={link.label} // For tablet hover
              >
                <link.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent-primary' : 'group-hover:text-accent-primary/70'}`} />
                <span className="hidden lg:block ml-3 truncate">{link.label}</span>
                {isActive && (
                   <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent-primary rounded-r-md" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-2 lg:p-4 border-t border-border-subtle flex flex-col gap-2">
           <Link
             href="/settings"
             className="flex items-center px-2 py-3 lg:px-3 rounded-lg text-text-secondary hover:bg-background-elevated hover:text-text-primary transition-colors"
             title="Configurações"
           >
             <Settings className="w-5 h-5 shrink-0" />
             <span className="hidden lg:block ml-3">Configurações</span>
           </Link>
           
           <div className="flex items-center mt-2 px-1 lg:px-2">
             <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0 border border-accent-muted">
                <span className="text-xs font-bold text-accent-primary">US</span>
             </div>
             <div className="hidden lg:flex flex-col ml-3 truncate">
               <span className="text-sm font-semibold text-text-primary truncate">User_Student</span>
               <span className="text-xs text-text-muted truncate">Lvl 4 Mage</span>
             </div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR (Mobile 56px, Desktop 64px) */}
        <header className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-border-subtle bg-background-surface/80 backdrop-blur-md z-10 shrink-0">
          
          {/* Mobile Logo */}
          <div className="flex md:hidden items-center text-accent-primary">
            <Swords className="w-6 h-6" />
          </div>

          <div className="hidden md:flex flex-1 items-center max-w-md ml-4 mr-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="w-full bg-background-base border border-border-subtle rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary text-text-primary transition-shadow"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center justify-end gap-3 flex-1 md:flex-none">
             
             {/* Streak Badge */}
             <div className="hidden sm:flex items-center bg-background-elevated px-2 py-1 rounded-md border border-border-subtle shadow-sm cursor-help" title="Ofensiva (Streak)">
               <span className="text-orange-500 mr-1 drop-shadow-sm">🔥</span>
               <span className="font-mono text-sm font-bold text-text-primary">12</span>
             </div>

             {/* XP Bar Component (desktop) */}
             <div className="hidden lg:block w-48 xl:w-64 border-l border-r border-border-subtle px-4 mx-2">
               <XPBar currentXP={480} currentLevel={4} xpForNextLevel={600} xpPreviousLevel={300} title="Acadêmico" />
             </div>

             {/* Notifications */}
             <button className="relative p-2 text-text-muted hover:text-text-primary transition-colors hover:bg-background-elevated rounded-full">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger animate-pulse border border-background-surface" />
             </button>

             {/* Mobile Avatar */}
             <div className="md:hidden w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center ml-1 border border-accent-muted">
                <span className="text-xs font-bold text-accent-primary">US</span>
             </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-background-base p-4 lg:p-6 pb-20 md:pb-6 relative">
          {children}
        </main>
      </div>

      {/* BOTTOM NAV (Mobile < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background-surface border-t border-border-subtle flex items-center justify-around px-2 z-50 safe-area-bottom shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {BOTTOM_NAV_LINKS.map((link) => {
          const isActive = pathname?.startsWith(link.href) || (pathname === '/' && link.href === '/dashboard');
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex flex-col items-center justify-center p-2 min-w-[3rem] transition-colors relative ${isActive ? 'text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}
            >
              <link.icon className={`w-6 h-6 mb-1 ${isActive ? 'drop-shadow-[0_0_8px_rgba(var(--accent-glow),0.4)]' : ''}`} />
              {isActive && (
                <span className="absolute -top-[1px] w-8 h-[3px] bg-accent-primary rounded-b-full shadow-[0_0_5px_rgba(var(--accent-glow),0.8)]" />
              )}
            </Link>
          )
        })}
      </nav>
      
    </div>
  );
}
