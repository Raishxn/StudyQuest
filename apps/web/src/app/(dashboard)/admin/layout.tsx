import Link from 'next/link';
import { Shield, ShieldAlert, Star, Users, UserCog, MessageSquareWarning } from 'lucide-react';
import { headers } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

function getAdminRole() {
    const headersList = headers();
    // Usually read from cookie for SSR in nextjs app router
    // We can mock this as a helper or expect client side check.
    // For layout, we will build a responsive sidebar that checks later or assume it's protected by middleware
    return 'ADMIN'; // Mock for now, use context in production
}

const adminNav = [
    { name: 'Dashboard', href: '/admin', icon: Star, roles: ['ADMIN', 'OWNER'] },
    { name: 'Moderação', href: '/admin/moderation', icon: MessageSquareWarning, roles: ['MOD_JUNIOR', 'MOD_SENIOR', 'ADMIN', 'OWNER'] },
    { name: 'Usuários', href: '/admin/users', icon: Users, roles: ['SUPPORT', 'MOD_JUNIOR', 'MOD_SENIOR', 'ADMIN', 'OWNER'] },
    { name: 'Cargos', href: '/admin/roles', icon: ShieldAlert, roles: ['MOD_SENIOR', 'ADMIN', 'OWNER'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // In a real scenario, role would be dynamically injected or checked client side. 
    // Middleware already protects these routes from unauthorized access.

    return (
        <div className="flex h-screen bg-[#050510] text-slate-200">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-[#0B0D19] flex flex-col">
                <div className="p-6 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center p-2 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                            <Shield className="w-full h-full text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">StudyQuest</span>
                            <span className="block text-xs font-medium text-indigo-400">Admin Console</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {adminNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            // Normally we'd check if user role is in item.roles
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 text-xs text-slate-500 text-center">
                    Ações são gravadas no log de auditoria.
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
