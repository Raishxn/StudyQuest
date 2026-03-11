export interface RankingResponse {
    top3: any[];
    list: any[];
    userPosition: number | null;
    totalLimit?: number;
    institutionName?: string;
    courseName?: string;
}

export const fetchRanking = async (type: string, period: string, subject?: string): Promise<RankingResponse> => {
    const token = localStorage.getItem('sq-token');

    let endpoint = type;
    if (type === 'hours') {
        endpoint = period === 'weekly' ? 'hours-week' : 'hours-month';
    } else if (type === 'subject') {
        endpoint = `subject/${subject}`;
    }

    const qs = type === 'global' || type === 'friends' || type === 'subject' || type === 'institution' || type === 'course' ? `?period=${period}` : '';
    const url = `${process.env.NEXT_PUBLIC_API_URL}/ranking/${endpoint}${qs}`;

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
