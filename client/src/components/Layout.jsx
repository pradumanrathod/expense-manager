import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-20 md:pb-0">{children}</main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
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
      className={`flex flex-col items-center justify-center px-4 py-2 ${
        active ? 'text-blue-600' : 'text-gray-600'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}

