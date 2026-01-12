import { useState, useEffect } from 'react';
import { toast, type ToastEvent } from '../../lib/toast';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX, FiLoader } from 'react-icons/fi';

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastEvent[]>([]);

    useEffect(() => {
        const unsubscribe = toast.subscribe((newToast) => {
            if (newToast.type === 'dismiss') {
                setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
                return;
            }

            setToasts((prev) => [...prev, newToast]);

            if (newToast.duration) {
                setTimeout(() => {
                    removeToast(newToast.id);
                }, newToast.duration);
            }
        });

        return () => unsubscribe();
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 w-full max-w-sm px-4 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 text-white pl-4 pr-3 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 w-auto min-w-[300px]"
                >
                    <div className="shrink-0 text-lg">
                        {t.type === 'success' && <FiCheckCircle className="text-green-500" />}
                        {t.type === 'error' && <FiAlertCircle className="text-red-500" />}
                        {t.type === 'info' && <FiInfo className="text-blue-500" />}
                        {t.type === 'warning' && <FiAlertTriangle className="text-orange-500" />}
                        {t.type === 'loading' && <FiLoader className="text-blue-500 animate-spin" />}
                    </div>
                    <p className="text-sm font-medium flex-grow mr-2">{t.message}</p>
                    <button
                        onClick={() => removeToast(t.id)}
                        className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <FiX size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}
