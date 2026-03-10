export interface RankingResponse {
    top3: any[];
    list: any[];
    userPosition: number | null;
    totalLimit?: number;
}

export const fetchRanking = async (type: string, period: string, subject?: string): Promise<RankingResponse> => {
    const token = localStorage.getItem('studyquest-token');
    const url = type === 'subject'
        ? `${process.env.NEXT_PUBLIC_API_URL}/ranking/subject/${subject}?period=${period}`
        : `${process.env.NEXT_PUBLIC_API_URL}/ranking/${type}?period=${period}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) throw new Error('Falha ao buscar ranking');
    return response.json();
};
