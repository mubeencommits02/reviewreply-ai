import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, LayoutDashboard, Settings, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 h-screen sticky top-0">
        <Link to="/dashboard" className="flex items-center gap-2 mb-10 group">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Star size={18} className="text-white fill-current" strokeWidth={1.75} />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">ReviewReply <span className="text-indigo-600">AI</span></span>
        </Link>

        <nav className="flex-1 space-y-2">
          <NavLink to="/dashboard" icon={<LayoutDashboard size={18} strokeWidth={1.75} />} label="Dashboard" active={location.pathname === '/dashboard'} />
          <NavLink to="/settings" icon={<Settings size={18} strokeWidth={1.75} />} label="Settings" active={location.pathname === '/settings'} />
        </nav>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <User size={16} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-800 truncate">{user?.email}</p>
              <p className="text-[9px] text-indigo-600 font-black uppercase tracking-widest">Active Plan</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={18} strokeWidth={1.75} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-50 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <Star size={16} className="text-white fill-current" strokeWidth={1.75} />
          </div>
          <span className="font-bold text-lg text-slate-900">ReviewReply <span className="text-indigo-600">AI</span></span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 bg-slate-50 rounded-xl border border-slate-200">
          {isMobileMenuOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
        </button>
      </header>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-white p-6 pt-24 flex flex-col"
          >
            <nav className="flex-1 space-y-4">
              <MobileNavLink to="/dashboard" icon={<LayoutDashboard size={24} strokeWidth={1.75} />} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} active={location.pathname === '/dashboard'} />
              <MobileNavLink to="/settings" icon={<Settings size={24} strokeWidth={1.75} />} label="Settings" onClick={() => setIsMobileMenuOpen(false)} active={location.pathname === '/settings'} />
            </nav>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-6 py-5 text-red-500 bg-red-50 rounded-2xl font-bold text-lg mt-auto"
            >
              <LogOut size={24} strokeWidth={1.75} /> Sign Out
            </button>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

const NavLink = ({ to, icon, label, active }) => {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
        active 
          ? 'bg-indigo-600 text-white shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon} {label}
    </Link>
  );
};

const MobileNavLink = ({ to, icon, label, onClick, active }) => {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-5 rounded-2xl transition-all font-bold text-xl ${
        active 
          ? 'bg-indigo-600 text-white shadow-sm' 
          : 'bg-slate-50 text-slate-500 border border-slate-100'
      }`}
    >
      {icon} {label}
    </Link>
  );
};

export default Layout;
