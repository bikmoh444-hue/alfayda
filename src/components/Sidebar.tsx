import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  Soup, 
  Beer, 
  Bus, 
  Users, 
  CalendarCheck, 
  CalendarDays, 
  FileText, 
  LogOut,
  Menu,
  X,
  Languages
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'nav.dashboard', path: '/', icon: LayoutDashboard },
  { name: 'nav.revenue', path: '/revenues', icon: TrendingUp },
  { name: 'nav.expenses', path: '/expenses', icon: Wallet },
  { name: 'nav.tajines', path: '/kitchen', icon: Soup },
  { name: 'nav.drinks', path: '/drinks', icon: Beer },
  { name: 'nav.bus', path: '/bus-drivers', icon: Bus },
  { name: 'nav.employees', path: '/employees', icon: Users },
  { name: 'nav.attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'nav.planning', path: '/planning', icon: CalendarDays },
  { name: 'nav.reports', path: '/reports', icon: FileText },
];

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className={cn(
          "lg:hidden fixed top-4 z-50 p-2 bg-white rounded-lg shadow-md",
          isRTL ? "right-4" : "left-4"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isRTL ? "right-0" : "left-0",
        isOpen 
          ? "translate-x-0" 
          : (isRTL ? "translate-x-full" : "-translate-x-full")
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold text-orange-500">{t('app.title')}</h1>
            <p className="text-xs text-slate-400 mt-1">{t('app.subtitle')}</p>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-orange-600 text-white" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{t(item.name)}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800 space-y-2">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
            >
              <Languages size={20} />
              <span className="font-medium">{language === 'fr' ? 'العربية' : 'Français'}</span>
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
