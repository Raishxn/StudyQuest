export interface RankingResponse {
    top3: any[];
    list: any[];
    userPosition: number | null;
    totalLimit?: number;
}

export const fetchRanking = async (type: string, period: string, subject?: string): Promise<RankingResponse> => {
    const token = localStorage.getItem('sq-token');
    const url = type === 'subject'
        ? `${process.env.NEXT_PUBLIC_API_URL}/ranking/subject/${subject}?period=${period}`
        : `${process.env.NEXT_PUBLIC_API_URL}/ranking/${type}?period=${period}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            console.error('API Error - fetchRanking:', response.status, errData);
            throw new Error(errData?.message || 'Falha ao buscar ranking');
        }

        return response.json();
    } catch (error) {
        console.error('Network Error - fetchRanking:', error);
        throw error;
    }
};
