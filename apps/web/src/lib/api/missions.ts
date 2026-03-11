const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sq-token') : '';
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export async function getWeeklyMissions() {
    const res = await fetch(`${API_URL}/missions/weekly`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Falha ao buscar missões semanais');
    return res.json();
}
