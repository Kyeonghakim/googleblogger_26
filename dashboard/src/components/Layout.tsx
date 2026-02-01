import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, History, Settings, LogOut, FileText } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: '대기 중인 글', icon: Home },
    { path: '/history', label: '발행 이력', icon: History },
    { path: '/settings', label: '설정', icon: Settings },
  ];

  const currentTitle = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-700" />
            Blogger Admin
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-800">{currentTitle}</h2>
        </header>
        <div className="flex-1 bg-slate-50 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
