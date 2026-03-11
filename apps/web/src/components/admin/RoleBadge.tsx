import { Shield, ShieldAlert, ShieldCheck, Crown, Wrench, User, Star } from "lucide-react";

export type Role = 'USER' | 'VERIFIED' | 'SUPPORT' | 'MOD_JUNIOR' | 'MOD_SENIOR' | 'ADMIN' | 'OWNER' | 'BANNED';

interface RoleBadgeProps {
    role: Role | string;
    className?: string;
    showIcon?: boolean;
}

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType; glow: string }> = {
    USER: {
        label: 'Usuário',
        color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        icon: User,
        glow: ''
    },
    VERIFIED: {
        label: 'Verificado',
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        icon: ShieldCheck,
        glow: 'shadow-[0_0_10px_rgba(59,130,246,0.2)]'
    },
    SUPPORT: {
        label: 'Suporte',
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        icon: Wrench,
        glow: 'shadow-[0_0_10px_rgba(16,185,129,0.2)]'
    },
    MOD_JUNIOR: {
        label: 'Tutor',
        color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        icon: Shield,
        glow: 'shadow-[0_0_10px_rgba(168,85,247,0.2)]'
    },
    MOD_SENIOR: {
        label: 'Moderador',
        color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
        icon: ShieldAlert,
        glow: 'shadow-[0_0_15px_rgba(217,70,239,0.3)]'
    },
    ADMIN: {
        label: 'Admin',
        color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        icon: Star,
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]'
    },
    OWNER: {
        label: 'Fundador',
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/40 font-bold',
        icon: Crown,
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]'
    },
    BANNED: {
        label: 'Banido',
        color: 'bg-red-950/50 text-red-500 border-red-500/50',
        icon: ShieldAlert,
        glow: ''
    },
};

export function RoleBadge({ role, className, showIcon = true }: RoleBadgeProps) {
    const uniformRole = role?.toUpperCase() || 'USER';
    const config = roleConfig[uniformRole] || roleConfig.USER;
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${config.color} ${config.glow} ${className || ''}`}
            title={`Cargo: ${config.label}`}
        >
            {showIcon && <Icon className="w-3.5 h-3.5" />}
            {config.label}
        </span>
    );
}
