const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sq-token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

export async function fetchPosts({ pageParam = '', subject = '', tags = [], solved, sort = 'recent' }: any) {
    const params = new URLSearchParams();
    if (pageParam) params.append('cursor', pageParam);
    if (subject) params.append('subject', subject);
    if (tags && tags.length) params.append('tags', tags.join(','));
    if (solved !== undefined) params.append('solved', String(solved));
    params.append('sort', sort);

    const res = await fetch(`${API_URL}/forum/posts?${params.toString()}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
}

export async function fetchPostById(id: string) {
    const res = await fetch(`${API_URL}/forum/posts/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch post');
    return res.json();
}

export async function createPost(data: any) {
    const res = await fetch(`${API_URL}/forum/posts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create post');
    }
    return res.json();
}

export async function togglePostUpvote(id: string) {
    const res = await fetch(`${API_URL}/forum/posts/${id}/upvote`, {
        method: 'POST',
        headers: getHeaders()
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to upvote');
    }
    return res.json();
}

export async function createReply(postId: string, data: any) {
    const res = await fetch(`${API_URL}/forum/posts/${postId}/replies`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create reply');
    }
    return res.json();
}

export async function toggleReplyUpvote(id: string) {
    const res = await fetch(`${API_URL}/forum/replies/${id}/upvote`, {
        method: 'POST',
        headers: getHeaders()
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to upvote reply');
    }
    return res.json();
}

export async function acceptReply(id: string) {
    const res = await fetch(`${API_URL}/forum/replies/${id}/accept`, {
        method: 'PATCH',
        headers: getHeaders()
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to accept reply');
    }
    return res.json();
}
