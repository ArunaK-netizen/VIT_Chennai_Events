import { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import client from '../../api/client';

const Dashboard = () => {
    // Extended Stats State
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalRegistrations: 0,
        paidCount: 0,
        unpaidCount: 0,
        vitCount: 0,       // Assuming backend provides this
        nonVitCount: 0     // Assuming backend provides this
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await client.get('/admin/stats');
                if (res.data.success) {
                    setStats(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const statCards = [
        {
            title: 'Revenue',
            value: `₹${stats.totalRevenue?.toFixed(0)}`,
            subtext: 'Total Collected',
            icon: <FiDollarSign className="w-6 h-6 text-green-400" />,
            color: 'text-green-400',
            bg: 'bg-green-500/10'
        },
        {
            title: 'Registrations',
            value: `${stats.totalRegistrations}`,
            subtext: `${stats.vitCount || 0} VIT • ${stats.nonVitCount || 0} Ext`,
            icon: <FiUsers className="w-6 h-6 text-blue-400" />,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'Paid',
            value: `${stats.paidCount}`,
            subtext: 'Confirmed Seats',
            icon: <FiCheckCircle className="w-6 h-6 text-purple-400" />,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10'
        },
        {
            title: 'Pending',
            value: `${stats.unpaidCount}`,
            subtext: 'Payment Pending',
            icon: <FiXCircle className="w-6 h-6 text-orange-400" />,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10'
        },
    ];

    if (loading) {
        return <div className="text-gray-500 animate-pulse">Loading dashboard...</div>;
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => (
                <div key={index} className="bg-[#151516] rounded-[24px] border border-white/5 p-6 hover:border-white/10 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className={`p-2 rounded-xl ${stat.bg}`}>
                            {stat.icon}
                        </div>
                    </div>

                    <div className="relative z-10 mt-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{stat.title}</p>
                        <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-xs font-medium text-gray-400">{stat.subtext}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Dashboard;
