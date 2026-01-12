import { useState, useEffect } from 'react';
import client from '../api/client';

interface IMerchItem {
    _id: string;
    name: string;
    price: number;
    image: string;
}

export default function Merch() {
    const [merchItems, setMerchItems] = useState<IMerchItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMerch() {
            try {
                const res = await client.get('/merch/');
                setMerchItems(res.data);
            } catch (error) {
                console.error("Failed to fetch merch", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMerch();
    }, []);

    const handleBuyNow = (itemId: string) => {
        alert(`Initiating purchase for item ${itemId}`);
    };

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="flex flex-col items-center text-center mb-24">
                    <span className="text-secondary font-bold uppercase tracking-widest text-xs mb-4">Official Gear</span>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                        Store.
                    </h1>
                    <p className="text-xl text-gray-500 max-w-xl">
                        Designed for the future. Wear the vision.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500">Loading Store...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {merchItems.map(item => (
                            <div key={item._id} className="group cursor-pointer">
                                {/* Image Container */}
                                <div className="aspect-square bg-[#151516] rounded-[32px] overflow-hidden mb-8 relative">
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                                    <img
                                        src={item.image || '/placeholder.png'}
                                        alt={item.name}
                                        className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105"
                                    />

                                    {/* Quick Buy Button (appears on hover) */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleBuyNow(item._id); }}
                                        className="absolute bottom-6 right-6 bg-white text-black px-6 py-3 rounded-full font-bold text-sm transform translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-105"
                                    >
                                        Buy Now
                                    </button>
                                </div>

                                {/* Text Info */}
                                <div className="flex justify-between items-start px-2">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-gray-300 transition-colors">{item.name}</h3>
                                        <p className="text-gray-500">TechnoVIT Collection 2026</p>
                                    </div>
                                    <span className="text-xl font-medium text-white">₹{item.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
