
import { useState, useEffect, type FormEvent } from 'react';

// Locally defining interface as I did for Club
interface IMerchItem {
    _id?: string;
    name: string;
    price: number;
    image: string;
    salesOpen: boolean;
}

interface MerchFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (merchData: Partial<IMerchItem>) => void;
    merchItem: IMerchItem | null;
}

export default function MerchFormModal({ isOpen, onClose, onSubmit, merchItem }: MerchFormModalProps) {
    const [formData, setFormData] = useState<Partial<IMerchItem>>({});

    useEffect(() => {
        if (merchItem) {
            setFormData(merchItem);
        } else {
            setFormData({
                name: '',
                price: 0,
                image: '',
                salesOpen: true,
            });
        }
    }, [merchItem]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            // @ts-ignore
            [name]: type === 'checkbox' ? e.target.checked : value,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-[#151516] border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6">{merchItem ? 'Edit Merch Item' : 'Create New Merch Item'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Merch Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-[#1F1F21] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                            placeholder="e.g. Official T-Shirt"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price || 0}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-[#1F1F21] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Image URL</label>
                        <input
                            type="text"
                            name="image"
                            value={formData.image || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#1F1F21] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                        <input
                            type="checkbox"
                            name="salesOpen"
                            checked={formData.salesOpen || false}
                            onChange={handleChange}
                            className="w-5 h-5 rounded bg-[#1F1F21] border-white/10 text-white focus:ring-0 checked:bg-green-500"
                        />
                        <label className="text-sm font-medium text-white">Open for Sales</label>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 text-sm font-bold text-black bg-white rounded-lg hover:bg-gray-200 transition-colors">
                            {merchItem ? 'Update Item' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
