import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <section className="flex items-center justify-center text-center min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-20">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-primary leading-tight">
                    Where Ideas Ignite &<br />Innovation Begins.
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                    Welcome to TechnoVIT, the nexus of creativity and technology. Join us for a celebration of the future, designed with intention and built for discovery.
                </p>
                <div className="mt-10">
                    <Link to="/events" className="inline-block px-10 py-4 text-base font-medium rounded-lg shadow-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                        Explore Events
                    </Link>
                </div>
            </div>
        </section>
    );
}
