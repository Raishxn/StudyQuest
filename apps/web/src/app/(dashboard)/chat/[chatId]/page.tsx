"use client";

import { ChatWindow } from '@/components/chat/ChatWindow';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function ChatDetailPage({ params }: { params: { chatId: string } }) {
    const router = useRouter();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 w-full relative">
            {/* Simple mobile back button */}
            <div className="absolute top-4 left-4 z-50 md:hidden">
                <button
                    onClick={() => router.push('/chat')}
                    className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-full shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Voltar para a lista"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            <ChatWindow chatId={params.chatId} />
        </div>
    );
}
