import { MessageSquareWarning, SearchCode, CheckCircle2 } from 'lucide-react';

export default function AdminModerationPage() {
    return (
        <div className="p-8 space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <MessageSquareWarning className="w-8 h-8 text-rose-500" />
                    Fila de Moderação
                </h1>
                <p className="text-slate-400">Analise denúncias contra posts do fórum, materiais do banco e conduta de usuários.</p>
            </header>

            <div className="flex gap-4 border-b border-white/10 pb-4">
                <button className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium">Todos (14)</button>
                <button className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium">Fórum (8)</button>
                <button className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium">Banco / Uploads (4)</button>
                <button className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium">Usuários (2)</button>
            </div>

            <div className="space-y-4">
                {/* Example Queue Item */}
                <div className="bg-[#0B0D19] border border-rose-500/20 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl pointer-events-none" />

                    <div className="flex-1 space-y-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">FÓRUM</span>
                            <span className="text-sm font-medium text-slate-400">Denunciado por 3 usuários</span>
                            <span className="text-sm text-slate-500 ml-auto flex items-center gap-1"><SearchCode className="w-4 h-4" /> UUID do Post: 9f23-88aa</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">"Qual a melhor forma de colar na prova do ENEM?"</h3>
                        <p className="text-sm text-slate-400 border-l-2 border-white/10 pl-4 py-1 italic">
                            Conteúdo do post denunciado seria exibido aqui para análise do moderador sem precisar abrir o link.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px] relative z-10 justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                        <button className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold rounded-xl border border-rose-500/20 transition-colors">
                            Remover Conteúdo
                        </button>
                        <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors">
                            Punir Autor
                        </button>
                        <button className="w-full py-2.5 flex items-center justify-center gap-2 text-slate-500 hover:text-emerald-400 font-medium transition-colors group mt-2">
                            <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Ignorar Report
                        </button>
                    </div>
                </div>

                {/* Example Queue Item 2 */}
                <div className="bg-[#0B0D19] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">BANCO DA FÁBULAS</span>
                            <span className="text-sm font-medium text-slate-400">Upload Suspeito</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Gabarito 2025 PDF Vazado.pdf</h3>
                        <p className="text-sm text-slate-400 border-l-2 border-white/10 pl-4 py-1 italic">
                            Enviado por ZezinhoSniper. Suspeita de infração de direitos autorais ou phishing.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px] justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                        <button className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold rounded-xl border border-rose-500/20 transition-colors">
                            Deletar Arquivo
                        </button>
                        <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors">
                            Bloquear Uploads
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
