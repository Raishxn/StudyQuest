import Link from 'next/link';

export default function BanidoPage() {
    return (
        <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6 bg-[#0B0D19]/80 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl relative overflow-hidden">
                {/* Visual fx */}
                <div className="absolute inset-0 bg-red-500/5 mix-blend-screen pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-red-500/30 blur-[80px] pointer-events-none" />

                <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto ring-1 ring-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                </div>

                <div className="space-y-3 relative z-10">
                    <h1 className="text-3xl font-black text-white px-2">Conta Suspensa</h1>
                    <p className="text-slate-300">Sua conta foi permanentemente banida da plataforma StudyQuest devido a violações graves dos Termos de Serviço.</p>
                </div>

                <div className="bg-black/40 text-left p-4 rounded-xl border border-red-500/10 space-y-2 text-sm text-slate-400">
                    <p>Motivos comuns para suspensão incluem:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Spam ou manipulação de moedas (Coins).</li>
                        <li>Upload de conteúdo malicioso ou ofensivo.</li>
                        <li>Engajamento tóxico recorrente no Fórum.</li>
                    </ul>
                </div>

                <div className="pt-4 space-y-4 text-sm relative z-10 border-t border-white/5">
                    <p className="text-slate-400">Acha que isso foi um erro?</p>
                    <a href="mailto:suporte@studyquest.com.br" className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10">
                        Entrar em Contato com Suporte
                    </a>

                    <Link href="/" className="block text-slate-500 hover:text-slate-300 transition-colors">
                        Voltar para a página inicial
                    </Link>
                </div>
            </div>
        </div>
    );
}
