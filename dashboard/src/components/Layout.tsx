import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, History, Settings, LogOut, FileEdit, PenSquare } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: '홈', icon: Home },
    { path: '/new', label: '새 글', icon: PenSquare },
    { path: '/history', label: '이력', icon: History },
    { path: '/settings', label: '설정', icon: Settings },
  ];

  const currentTitle = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-zinc-50">
      <aside className="hidden md:flex w-64 flex-col bg-zinc-900 border-r border-zinc-800 text-zinc-300">
        <div className="h-14 flex items-center px-4 border-b border-zinc-800">
          <h1 className="text-sm font-semibold text-zinc-100 flex items-center gap-2 tracking-tight">
            <div className="w-6 h-6 rounded bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <FileEdit size={14} className="ml-0.5" />
            </div>
            Blogger Admin
          </h1>
        </div>
        
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-red-400 rounded-md transition-colors duration-150 text-left"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-14 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between border-b border-zinc-100 bg-white/80 backdrop-blur-sm">
          <h2 className="text-sm md:text-base font-semibold text-zinc-800">{currentTitle}</h2>
          <button
            onClick={handleLogout}
            className="md:hidden p-2 text-zinc-400 hover:text-red-500 transition-colors"
            title="로그아웃"
          >
            <LogOut size={18} />
          </button>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-8 animate-fade-in">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-around items-center h-16 z-50 safe-area-pb">

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-150 ${
                isActive
                  ? 'text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

