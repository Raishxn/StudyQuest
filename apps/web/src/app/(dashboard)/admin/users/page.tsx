import { RoleBadge } from '@/components/admin/RoleBadge';

export default function AdminUsersPage() {
    return (
        <div className="p-8 space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-black text-white">Gerenciamento de Usuários</h1>
                <p className="text-slate-400">Pesquise contas, verifique IPs e histórico de punições.</p>
            </header>

            <div className="bg-[#0B0D19] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center gap-4">
                    <input type="text" placeholder="Buscar por @username, ID ou Email..." className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">Localizar</button>
                </div>

                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-slate-400">
                                <th className="py-3 px-4">Usuário</th>
                                <th className="py-3 px-4">Cargo Atual</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20"></div>
                                    <div>
                                        <p className="font-semibold text-white">Erick</p>
                                        <p className="text-xs text-slate-500">xyz-123</p>
                                    </div>
                                </td>
                                <td className="py-3 px-4"><RoleBadge role="OWNER" /></td>
                                <td className="py-3 px-4"><span className="text-emerald-400">Ativo</span></td>
                                <td className="py-3 px-4 text-right">
                                    <button className="text-indigo-400 hover:text-indigo-300 font-medium">Inspecionar</button>
                                </td>
                            </tr>
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-rose-500/20"></div>
                                    <div>
                                        <p className="font-semibold text-white">Spammer123</p>
                                        <p className="text-xs text-slate-500">xyz-999</p>
                                    </div>
                                </td>
                                <td className="py-3 px-4"><RoleBadge role="BANNED" /></td>
                                <td className="py-3 px-4"><span className="text-red-500">Suspenso</span></td>
                                <td className="py-3 px-4 text-right">
                                    <button className="text-indigo-400 hover:text-indigo-300 font-medium">Inspecionar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
