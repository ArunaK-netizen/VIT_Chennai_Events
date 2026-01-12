
import { useState, useEffect } from 'react';
import { toast } from '../lib/toast';
import client from '../api/client';
import MerchFormModal from '../components/admin/MerchFormModal';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

interface IMerchItem {
    _id: string;
    name: string;
    price: number;
    image: string;
    salesOpen: boolean;
}

export default function AdminMerch() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [merchItems, setMerchItems] = useState<IMerchItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<IMerchItem | null>(null);

    const fetchMerchItems = async () => {
        try {
            const response = await client.get('/merch/'); // Fixed path
            setMerchItems(response.data);
        } catch (error: any) {
            toast.error('Failed to load merch items.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMerchItems();
    }, []);

    const handleCreateOrUpdate = async (merchData: Partial<IMerchItem>) => {
        try {
            if (selectedItem) {
                await client.put(`/merch/${selectedItem._id}`, merchData);
                toast.success('Merch item updated successfully!');
            } else {
                await client.post('/merch/', merchData);
                toast.success('Merch item created successfully!');
            }
            setIsModalOpen(false);
            setSelectedItem(null);
            fetchMerchItems();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await client.delete(`/merch/${id}`);
            toast.success("Item deleted");
            setMerchItems(prev => prev.filter(i => i._id !== id));
        } catch (e) {
            toast.error("Failed to delete");
        }
    }

    const openModal = (item?: IMerchItem) => {
        setSelectedItem(item || null);
        setIsModalOpen(true);
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Merchandise</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                    <FiPlus /> New Item
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {merchItems.length === 0 ? (
                    <div className="col-span-full py-20 text-center rounded-3xl border border-white/5 bg-[#151516]">
                        <p className="text-gray-500">No merchandise items found.</p>
                    </div>
                ) : (
                    merchItems.map((item) => (
                        <div key={item._id} className="bg-[#151516] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all">
                            <div className="aspect-video bg-black/50 relative overflow-hidden">
                                <img src={item.image || 'https://placehold.co/400'} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute top-4 right-4">
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10 backdrop-blur-md ${item.salesOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {item.salesOpen ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{item.name}</h2>
                                    <p className="text-xl font-bold text-white">₹{item.price}</p>
                                </div>

                                <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
                                    <button onClick={() => openModal(item)} className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2">
                                        <FiEdit2 /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(item._id)} className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <MerchFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateOrUpdate}
                merchItem={selectedItem}
            />
        </div>
    );
}
