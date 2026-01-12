
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import ToastContainer from './components/ui/ToastContainer';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import AdminLayout from './layouts/AdminLayout';
import EventsTable from './components/admin/EventsTable';
import AdminMerch from './pages/AdminMerch';
import Merch from './pages/Merch';

import Dashboard from './pages/Dashboard';
import AdminEventCreate from './pages/AdminEventCreate';
import AdminEventDetails from './pages/AdminEventDetails';
import Admin from './pages/Admin';
import AdminUsers from './pages/AdminUsers';
import AdminClubs from './pages/AdminClubs';
import AdminCoordinators from './pages/AdminCoordinators';

import { GoogleOAuthProvider } from '@react-oauth/google';

// Use environment variable or a placeholder. Real ID needed for it to work.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/merch" element={<Merch />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Admin />} />
                  <Route path="merch" element={<AdminMerch />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="clubs" element={<AdminClubs />} />
                  <Route path="coordinators" element={<AdminCoordinators />} />
                  <Route path="events" element={<EventsTable />} />
                  <Route path="events/new" element={<AdminEventCreate />} />
                  <Route path="events/:id/edit" element={<AdminEventCreate />} />
                  <Route path="events/:id" element={<AdminEventDetails />} />
                </Route>
              </Routes>
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
