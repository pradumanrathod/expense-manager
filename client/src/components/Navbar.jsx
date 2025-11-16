import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass border-b border-white/20 shadow-lg sticky top-0 z-40 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-2xl font-bold gradient-text hover:scale-105 transition-transform duration-300 flex items-center gap-2"
            >
              <span className="text-3xl animate-bounce-slow">💰</span>
              <span>Expense Tracker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" label="Dashboard" active={isActive('/')} />
            <NavLink to="/reports" label="Reports" active={isActive('/reports')} />
            <NavLink to="/categories" label="Categories" active={isActive('/categories')} />
            <NavLink to="/budgets" label="Budgets" active={isActive('/budgets')} />
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-300">
              <span className="text-sm font-medium text-gray-700">Hi, {user?.name} 👋</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile User Info */}
          <div className="md:hidden flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-xs text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105'
          : 'text-gray-700 hover:bg-purple-100 hover:text-purple-600'
      }`}
    >
      {label}
    </Link>
  );
}

