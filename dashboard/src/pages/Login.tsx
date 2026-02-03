import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/login', { password });
      if (res.token) {
        localStorage.setItem('auth_token', res.token);
        navigate('/');
      } else {
        setError('로그인 실패');
      }
    } catch (err) {
      setError('비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-4 text-zinc-900">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">관리자 로그인</h1>
            <p className="text-sm text-zinc-500 mt-2">서비스 접속을 위해 인증이 필요합니다</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400 text-sm bg-zinc-50/50"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-500 text-xs bg-red-50 p-3 rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || !password}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>로그인</span>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-zinc-50 py-4 text-center border-t border-zinc-100">
          <p className="text-xs text-zinc-400">© 2024 Google Blogger Automation</p>
        </div>
      </div>
    </div>
  );
}
