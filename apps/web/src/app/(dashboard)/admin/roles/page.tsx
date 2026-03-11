import { ShieldAlert, Shield } from 'lucide-react';
import { RoleBadge } from '@/components/admin/RoleBadge';

export default function AdminRolesPage() {
    return (
        <div className="p-8 space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-black text-white">Hierarquia de Cargos</h1>
                <p className="text-slate-400">Atribua ou revogue permissões de nível superior. Lembre-se que você só pode promover/rebaixar até o cargo imediatamente abaixo do seu, de acordo com a hierarquia.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#0B0D19] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Atribuir Cargo</h2>
                            <p className="text-sm text-slate-400">Promova um usuário via ID</p>
                        </div>
                    </div>

                    <form className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">ID do Usuário Alvo</label>
                            <input type="text" placeholder="UUID do usuário..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Novo Cargo</label>
                            <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none">
                                <option value="SUPPORT">Suporte Geral</option>
                                <option value="MOD_JUNIOR">Moderador Júnior (Tutor)</option>
                                <option value="MOD_SENIOR">Moderador Sênior (Supervisor)</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Motivo (Obrigatório p/ auditoria)</label>
                            <textarea rows={3} placeholder="Descreva o motivo da promoção..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"></textarea>
                        </div>

                        <button type="button" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20">
                            Confirmar Promoção
                        </button>
                    </form>
                </div>

                <div className="bg-[#0B0D19] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Equipe Atual</h2>
                            <p className="text-sm text-slate-400">Moderadores em atividade</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <RoleBadge role="OWNER" />
                                <span className="font-medium text-white">Erick</span>
                            </div>
                            <span className="text-xs text-slate-500">Intocável</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <RoleBadge role="MOD_JUNIOR" />
                                <span className="font-medium text-white">Joãozinho</span>
                            </div>
                            <button className="text-xs font-semibold text-rose-400 hover:text-rose-300">Rebaixar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
