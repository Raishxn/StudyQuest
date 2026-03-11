const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sq-token') : '';
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

// ==========================================
// FRIENDS API
// ==========================================

export async function searchUsers(query: string) {
    if (!query) return [];
    const res = await fetch(`${API_URL}/friends/search?q=${encodeURIComponent(query)}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Falha ao buscar usuários');
    return res.json();
}

export async function sendFriendRequest(targetUserId: string) {
    const res = await fetch(`${API_URL}/friends/request`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ targetUserId }),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Falha ao enviar solicitação');
    }
    return res.json();
}

export async function getPendingRequests() {
    const res = await fetch(`${API_URL}/friends/pending`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Falha ao buscar solicitações pendentes');
    return res.json();
}

export async function getFriends(page: number = 1, limit: number = 20) {
    const res = await fetch(`${API_URL}/friends?page=${page}&limit=${limit}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Falha ao buscar amigos');
    return res.json();
}

export async function acceptFriendRequest(friendshipId: string) {
    const res = await fetch(`${API_URL}/friends/${friendshipId}/accept`, {
        method: 'PATCH',
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Falha ao aceitar solicitação');
    return res.json();
}

export async function removeFriend(friendshipId: string) {
    const res = await fetch(`${API_URL}/friends/${friendshipId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Falha ao remover amigo');
    return res.json();
}

// Helper para descobrir se já existe Chat (útil se precisarmos antes de entrar)
// O backend já faz isso no createChat, então só usaremos aquele.

export async function createDM(targetUserId: string) {
    const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ type: 'DM', targetUserId }),
    });
    if (!res.ok) {
        throw new Error('Falha ao iniciar conversa');
    }
    return res.json();
}
