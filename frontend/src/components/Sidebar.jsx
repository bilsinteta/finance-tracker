
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiPieChart, FiSettings, FiLogOut, FiCreditCard, FiCalendar, FiList } from 'react-icons/fi';
import { cn } from '../lib/utils';
import Button from './ui/Button';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { icon: FiHome, label: 'Ikhtisar', path: '/dashboard' },
        { icon: FiSettings, label: 'Pengaturan', path: '/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-40 h-screen w-64 transition-transform bg-white border-r border-gray-200 shadow-sm",
            isOpen ? "translate-x-0" : "-translate-x-full",
            "sm:translate-x-0"
        )}>
            <div className="flex h-full flex-col">
                {/* Logo Area */}
                <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-100">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500 text-white shadow-sm">
                        <span className="text-lg font-bold">💰</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800 tracking-tight">
                        Anggaran Cepat
                    </span>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors border-l-4",
                                        location.pathname === item.path
                                            ? "border-primary text-primary bg-blue-50"
                                            : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", location.pathname === item.path ? "text-primary" : "text-gray-400")} />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors"
                    >
                        <FiLogOut className="h-5 w-5" />
                        Keluar
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
