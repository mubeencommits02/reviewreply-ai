import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, LayoutDashboard, Settings, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 p-6 h-screen sticky top-0">
        <Link to="/dashboard" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <Star className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="font-bold text-lg text-slate-900">ReviewReply <span className="text-blue-600">AI</span></span>
        </Link>

        <nav className="flex-1 space-y-2">
          <NavLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
          <NavLink to="/settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
        </nav>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.email}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pro User</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-100 p-4 sticky top-0 z-50 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Star className="text-white w-4 h-4 fill-current" />
          </div>
          <span className="font-bold text-base text-slate-900">ReviewReply <span className="text-blue-600">AI</span></span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 bg-slate-100 rounded-lg">
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="md:hidden fixed inset-0 z-40 bg-white p-6 pt-20 flex flex-col pt-24"
          >
            <nav className="flex-1 space-y-4">
              <MobileNavLink to="/dashboard" icon={<LayoutDashboard className="w-6 h-6" />} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavLink to="/settings" icon={<Settings className="w-6 h-6" />} label="Settings" onClick={() => setIsMobileMenuOpen(false)} />
            </nav>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-6 py-4 text-red-500 bg-red-50 rounded-2xl font-bold text-lg mt-auto"
            >
              <LogOut className="w-6 h-6" /> Sign Out from App
            </button>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

const NavLink = ({ to, icon, label }) => {
  const isActive = window.location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon} {label}
    </Link>
  );
};

const MobileNavLink = ({ to, icon, label, onClick }) => {
  const isActive = window.location.pathname === to;
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-5 rounded-2xl transition-all font-bold text-xl ${
        isActive 
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
          : 'bg-slate-50 text-slate-500'
      }`}
    >
      {icon} {label}
    </Link>
  );
};

export default Layout;
