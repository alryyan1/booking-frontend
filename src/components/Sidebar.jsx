import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Receipt, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Package, 
  Settings2, 
  LogOut,
  Sparkles,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuGroups = [
        {
            label: "Operations",
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
                { icon: CalendarDays, label: 'Calendar Matrix', path: '/month' },
                { icon: ClipboardList, label: 'Reservations', path: '/bookings' },
                { icon: Package, label: 'Accessories', path: '/accessories' },
            ]
        },
        {
            label: "Administrative",
            adminOnly: true,
            items: [
                { icon: BarChart3, label: 'Intelligence', path: '/reports' },
                { icon: Users, label: 'Personnel', path: '/users' },
                { icon: ShieldCheck, label: 'System Settings', path: '/settings' },
            ]
        }
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-slate-300 flex flex-col z-50">
            {/* Logo Section */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-2 mb-10">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight uppercase">L'Alryyan</span>
                </div>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto scrollbar-hide">
                {menuGroups.map((group, groupIdx) => {
                    if (group.adminOnly && user?.role !== 'admin') return null;
                    return (
                        <div key={groupIdx} className="space-y-4">
                            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {group.label}
                            </p>
                            <div className="space-y-1">
                                {group.items.map((item, itemIdx) => {
                                    const isActive = location.pathname === item.path || 
                                                  (item.path !== '/' && location.pathname.startsWith(item.path));
                                    return (
                                        <Link
                                            key={itemIdx}
                                            to={item.path}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                                                isActive 
                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                                                    : "hover:bg-slate-800 hover:text-white"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "h-4 w-4 shrink-0 transition-colors",
                                                isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                                            )} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="p-4 bg-slate-800/40 rounded-xl mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white uppercase">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{user?.role}</p>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        onClick={handleLogout}
                        className="w-full justify-start text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 p-2 h-auto"
                    >
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out Session
                    </Button>
                </div>
                <p className="text-[9px] text-center text-slate-600 font-medium uppercase tracking-widest">
                    Version 2.04.1-Stable
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
