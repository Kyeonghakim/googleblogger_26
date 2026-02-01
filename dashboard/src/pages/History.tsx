import { useEffect, useState } from 'react';
import { api } from '../api';
import { History as HistoryIcon, ExternalLink, Archive } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  published_at: string | number;
  status: string;
  url?: string;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.get('/api/history');
      setHistory(Array.isArray(data) ? data : data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateInput: string | number) => {
    const date = new Date(dateInput);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return <div className="text-slate-500 p-8">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <HistoryIcon className="w-6 h-6 text-slate-600" />
        <h1 className="text-2xl font-semibold text-slate-900">발행 이력</h1>
      </div>
      
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Archive className="w-12 h-12 mb-4" />
          <p>발행 이력이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500">{formatDate(item.published_at)}</p>
                </div>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition-colors ${item.url ? 'hover:bg-slate-100 text-slate-600' : 'text-slate-300 cursor-not-allowed'}`}
                  onClick={(e) => !item.url && e.preventDefault()}
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
