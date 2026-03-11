'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const emptyChartData = [
    { name: 'Seg', hours: 0, xp: 0 },
    { name: 'Ter', hours: 0, xp: 0 },
    { name: 'Qua', hours: 0, xp: 0 },
    { name: 'Qui', hours: 0, xp: 0 },
    { name: 'Sex', hours: 0, xp: 0 },
    { name: 'Sáb', hours: 0, xp: 0 },
    { name: 'Dom', hours: 0, xp: 0 },
];

export function WeeklyActivityChart() {
    const { token } = useAuthStore();
    const [data, setData] = useState(emptyChartData);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (!token) return;

        let mounted = true;

        fetch(`${apiUrl}/study/sessions/weekly-chart`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : emptyChartData)
            .then(chartData => {
                if (!mounted) return;
                setData(Array.isArray(chartData) && chartData.length > 0 ? chartData : emptyChartData);
                setIsLoading(false);
            })
            .catch(() => {
                if (mounted) {
                    setData(emptyChartData);
                    setIsLoading(false);
                }
            });

        return () => { mounted = false; };
    }, [token, apiUrl]);

    // Try to find CSS variables for chart colors, fallback to hardcoded hex
    const CSS_VAR_ACCENT = typeof window !== 'undefined'
        ? getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim()
        : '#8b5cf6'; // fallback

    const renderTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background-elevated border border-border-subtle p-3 rounded-lg shadow-lg">
                    <p className="font-bold text-text-primary mb-1">{label}</p>
                    <p className="text-info text-sm">
                        <span className="font-semibold">{payload[0].value.toFixed(1)}</span> horas estudadas
                    </p>
                    {payload[0].payload.xp !== undefined && (
                        <p className="text-accent-primary text-sm mt-1">
                            <span className="font-semibold">+{payload[0].payload.xp}</span> XP
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-background-surface border border-border-subtle rounded-xl p-4 lg:p-6 shadow-sm flex flex-col h-full min-h-[350px]"
        >
            <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-accent-primary" />
                <h2 className="text-lg font-bold font-[family-name:var(--font-cinzel)] text-text-primary tracking-wide">
                    Atividade Semanal
                </h2>
            </div>

            <div className="flex-1 w-full relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="name"
                                tick={{ fill: 'var(--text-muted)' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: 'var(--text-muted)' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => `${val}h`}
                            />
                            <Tooltip
                                content={renderTooltip}
                                cursor={{ fill: 'var(--background-elevated)', opacity: 0.4 }}
                            />
                            <Bar
                                dataKey="hours"
                                radius={[4, 4, 0, 0]}
                                animationDuration={1500}
                            >
                                {
                                    data.map((entry, index) => {
                                        const todayDayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                                        const todayName = todayDayMap[new Date().getDay()];
                                        // Highlight today's bar
                                        const isToday = entry.name === todayName;

                                        return (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={isToday ? 'var(--accent-primary)' : 'var(--accent-muted)'}
                                                style={{ filter: isToday ? 'drop-shadow(0 0 8px rgba(var(--accent-glow), 0.5))' : 'none' }}
                                            />
                                        );
                                    })
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
}
