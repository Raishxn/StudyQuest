// Layout wrapper to show the chat list next to the active chat on larger screens
import ChatPage from './page';

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-white dark:bg-slate-950">
            <div className="hidden md:flex flex-col">
                <ChatPage />
            </div>

            {/* Container principal (lista no mobile, chat no desktop se tiver children, ou "Selecione" / nada no desktop) */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-50 dark:bg-slate-900">
                {children || (
                    <div className="hidden md:flex h-full items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700 shadow-sm">💬</div>
                            <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300">Selecione uma conversa</h2>
                            <p className="mt-2 text-sm max-w-xs mx-auto text-slate-500">Ou inicie uma nova conversa para colaborar com seus amigos de classe.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
