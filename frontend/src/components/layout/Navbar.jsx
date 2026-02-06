import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { Menu, X, User, LogOut, Bell } from 'lucide-react';

const NavLink = ({ to, children, onClick }) => (
  <Link 
    to={to} 
    className="text-gray-600 hover:text-indigo-600 font-medium transition-colors px-3 py-2"
    onClick={onClick}
  >
    {children}
  </Link>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                EventHorizon
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <NavLink to="/" onClick={closeMenu}>Home</NavLink>
              <NavLink to="/explore" onClick={closeMenu}>Explore Events</NavLink>
              {user && <NavLink to="/my-tickets" onClick={closeMenu}>My Tickets</NavLink>}
              {user?.role === 'organizer' && <NavLink to="/organizer/dashboard" onClick={closeMenu}>Organizer Dashboard</NavLink>}
              {user?.role === 'admin' && <NavLink to="/admin/dashboard" onClick={closeMenu}>Admin Panel</NavLink>}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/notifications" className="text-gray-600 hover:text-indigo-600 relative">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">3</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                   {user.profileImage ? (
                       <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full object-cover"/>
                   ) : (
                       <User size={18} />
                   )}
                  </div>
                  <span className="font-medium">{user.name}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <NavLink to="/" onClick={closeMenu}>Home</NavLink>
            <NavLink to="/explore" onClick={closeMenu}>Explore Events</NavLink>
            {user && <NavLink to="/my-tickets" onClick={closeMenu}>My Tickets</NavLink>}
            
            {user ? (
              <div className="border-t border-gray-100 mt-2 pt-2">
                <div className="px-3 py-2 flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
                <NavLink to="/profile" onClick={closeMenu}>Profile</NavLink>
                {user.role === 'organizer' && <NavLink to="/organizer/dashboard" onClick={closeMenu}>Dashboard</NavLink>}
                <button 
                    onClick={handleLogout}
                    className="w-full text-left text-red-600 font-medium px-3 py-2 hover:bg-red-50 rounded-md"
                >
                    Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-100 mt-2 pt-2 flex flex-col space-y-2 px-3">
                <Link to="/login" onClick={closeMenu}>
                  <Button variant="secondary" className="w-full">Login</Button>
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
