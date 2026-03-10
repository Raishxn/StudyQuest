import { create } from 'zustand';

// Tipos simplificados para o estado do chat
export interface Message {
    id: string;
    senderId: string;
    body?: string;
    fileUrl?: string;
    createdAt: string;
    sender: {
        id: string;
        username: string;
        avatarUrl?: string;
    };
}

export interface Conversation {
    id: string;
    type: 'DM' | 'GROUP';
    name?: string;
    unreadCount?: number;
    members: any[];
    messages: Message[];
}

interface ChatStore {
    conversations: Map<string, Conversation>;
    messages: Map<string, Message[]>;
    activeConversationId: string | null;
    unreadCounts: Map<string, number>;

    // Actions
    setConversations: (convs: Conversation[]) => void;
    setMessages: (chatId: string, msgs: Message[]) => void;
    addMessage: (chatId: string, msg: Message) => void;
    markAsRead: (chatId: string) => void;
    setActiveConversation: (chatId: string | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    conversations: new Map(),
    messages: new Map(),
    activeConversationId: null,
    unreadCounts: new Map(),

    setConversations: (convs) =>
        set((state: ChatStore) => {
            const newMap = new Map(state.conversations);
            const newUnreads = new Map(state.unreadCounts);
            convs.forEach(c => {
                newMap.set(c.id, c);
                newUnreads.set(c.id, c.unreadCount || 0);
            });
            return { conversations: newMap, unreadCounts: newUnreads };
        }),

    setMessages: (chatId, msgs) =>
        set((state: ChatStore) => {
            const newMsgs = new Map(state.messages);
            newMsgs.set(chatId, msgs);
            return { messages: newMsgs };
        }),

    addMessage: (chatId, msg) =>
        set((state: ChatStore) => {
            // Add message to chat list
            const newMsgs = new Map(state.messages);
            const chatMsgs = newMsgs.get(chatId) || [];

            // Avoid duplicates
            if (!chatMsgs.find(m => m.id === msg.id)) {
                newMsgs.set(chatId, [...chatMsgs, msg]);
            }

            // Update conversations last message
            const newConvs = new Map(state.conversations);
            const conv = newConvs.get(chatId);
            if (conv) {
                newConvs.set(chatId, { ...conv, messages: [msg] });
            }

            // Increment unread if not active chat
            const newUnreads = new Map(state.unreadCounts);
            if (state.activeConversationId !== chatId) {
                newUnreads.set(chatId, (newUnreads.get(chatId) || 0) + 1);
            }

            return { messages: newMsgs, conversations: newConvs, unreadCounts: newUnreads };
        }),

    markAsRead: (chatId) =>
        set((state: ChatStore) => {
            const newUnreads = new Map(state.unreadCounts);
            newUnreads.set(chatId, 0);
            return { unreadCounts: newUnreads };
        }),

    setActiveConversation: (chatId) =>
        set((state: ChatStore) => {
            const newUnreads = new Map(state.unreadCounts);
            if (chatId) newUnreads.set(chatId, 0); // Limpar não lidas ao abrir
            return { activeConversationId: chatId, unreadCounts: newUnreads };
        }),
}));
