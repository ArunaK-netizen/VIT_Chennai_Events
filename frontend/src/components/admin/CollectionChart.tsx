import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import client from '../../api/client';

export default function CollectionChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch events to get revenue breakdown
                const res = await client.get('/admin/events');
                if (res.data.success) {
                    const events = res.data.data;
                    // Sort descending by revenue and take top 5
                    // @ts-ignore
                    const sorted = events.sort((a, b) => b.amountCollected - a.amountCollected).slice(0, 5);

                    const chartData = sorted.map((e: any) => ({
                        name: e.name.length > 15 ? e.name.substring(0, 15) + '...' : e.name,
                        Revenue: e.amountCollected
                    }));

                    // @ts-ignore
                    setData(chartData);
                }
            } catch (error) {
                console.error("Failed to fetch chart data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return <div className="h-64 flex items-center justify-center text-gray-500">Loading chart...</div>;
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#151516',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar
                        dataKey="Revenue"
                        fill="#3b82f6"
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                        activeBar={{ fill: '#60a5fa' }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
