import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/admin/AdminNavbar';
import { useAuth } from '../context/AuthContext';
import NotFound from '../pages/NotFound';

export default function AdminLayout() {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    // Strict Role Check: If not admin/super_coordinator, show 404
    // This effectively "hides" the admin routes
    if (!user || (user.role !== 'admin' && user.role !== 'super_coordinator' && user.role !== 'coordinator')) {
        return <NotFound />;
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <AdminNavbar />

            {/* 
                Main Content Area
                Padding top accounts for the floating navbar + spacing 
            */}
            <main className="pt-28 pb-12 px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
