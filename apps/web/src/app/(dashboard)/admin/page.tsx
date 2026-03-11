import { Shield, Users, AlertTriangle } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div className="p-8 space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
                <p className="text-slate-400">Bem-vindo ao painel de controle do StudyQuest. Verifique as métricas de moderação abaixo.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0B0D19] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-300">Usuários Ativos</h3>
                        <Users className="w-5 h-5 text-indigo-400" />
                    </div>
                    <p className="text-4xl font-black text-white">4,092</p>
                </div>

                <div className="bg-[#0B0D19] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-300">Reports Pendentes</h3>
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-4xl font-black text-white">14</p>
                </div>

                <div className="bg-[#0B0D19] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-300">Cargos Modificados</h3>
                        <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-4xl font-black text-white">3</p>
                    <p className="text-xs text-slate-500">Últimos 7 dias</p>
                </div>
            </div>

            <div className="bg-[#0B0D19] border border-white/5 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4">Atividade Recente</h2>
                <div className="text-slate-400 text-sm flex items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-xl">
                    Gráfico de auditoria será implementado aqui.
                </div>
            </div>
        </div>
    );
}
