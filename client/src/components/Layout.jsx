import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pb-20 md:pb-8 animate-fade-in">{children}</main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/20 md:hidden z-50 shadow-lg">
        <div className="flex justify-around items-center h-16">
          <NavLink to="/" icon="🏠" label="Home" active={location.pathname === '/'} />
          <NavLink to="/reports" icon="📊" label="Reports" active={location.pathname === '/reports'} />
          <NavLink to="/categories" icon="📁" label="Categories" active={location.pathname === '/categories'} />
          <NavLink to="/budgets" icon="💰" label="Budgets" active={location.pathname === '/budgets'} />
        </div>
      </nav>
    </div>
  );
}

function NavLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-300 ${
        active 
          ? 'text-purple-600 scale-110' 
          : 'text-gray-600 hover:text-purple-500 hover:scale-105'
      }`}
    >
      <span className={`text-2xl transition-transform duration-300 ${active ? 'animate-bounce-slow' : ''}`}>
        {icon}
      </span>
      <span className={`text-xs mt-1 font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    </Link>
  );
}

