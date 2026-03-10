const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getHeaders = () => {
    const token = localStorage.getItem('sq-token');
    return {
        'Authorization': `Bearer ${token}`
    };
};

export async function uploadBankItem(formData: FormData) {
    const res = await fetch(`${API_URL}/bank/upload`, {
        method: 'POST',
        headers: getHeaders(), // Do NOT set Content-Type here; browser sets it with boundaries for FormData
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao enviar material');
    }
    return res.json();
}

export async function fetchBankItems(params: { cursor?: string; subject?: string; professor?: string; type?: string; period?: string; institutionId?: string; courseId?: string; sort?: string }) {
    const queryParams = new URLSearchParams();
    if (params.cursor) queryParams.append('cursor', params.cursor);
    if (params.subject) queryParams.append('subject', params.subject);
    if (params.professor) queryParams.append('professor', params.professor);
    if (params.type) queryParams.append('type', params.type);
    if (params.period) queryParams.append('period', params.period);
    if (params.institutionId) queryParams.append('institutionId', params.institutionId);
    if (params.courseId) queryParams.append('courseId', params.courseId);
    if (params.sort) queryParams.append('sort', params.sort);

    const res = await fetch(`${API_URL}/bank?${queryParams.toString()}`, {
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) throw new Error('Erro ao listar materiais');
    return res.json(); // { data: [...], nextCursor: ... }
}

export async function fetchBankItemById(id: string) {
    const res = await fetch(`${API_URL}/bank/${id}`, {
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        }
    });
    if (!res.ok) throw new Error('Erro ao buscar material');
    return res.json();
}

export async function addBankComment(id: string, body: string, fileUrl?: string) {
    const res = await fetch(`${API_URL}/bank/${id}/comments`, {
        method: 'POST',
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body, fileUrl }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao comentar');
    }
    return res.json();
}

export async function rateBankItem(id: string, score: number) {
    const res = await fetch(`${API_URL}/bank/${id}/rate`, {
        method: 'POST',
        headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao avaliar');
    }
    return res.json();
}
