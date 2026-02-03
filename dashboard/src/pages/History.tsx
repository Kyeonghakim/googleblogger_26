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

  if (loading) return <div className="text-zinc-500 p-8">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <HistoryIcon className="w-6 h-6 text-zinc-900" />
        <h1 className="text-2xl font-semibold text-zinc-900">발행 이력</h1>
      </div>
      
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400 bg-white border border-zinc-100 rounded-xl">
          <Archive className="w-12 h-12 mb-4 text-zinc-300" />
          <p>발행 이력이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden">
          {history.map(item => (
            <div key={item.id} className="p-6 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-zinc-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-zinc-400">{formatDate(item.published_at)}</p>
                </div>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition-colors ${item.url ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' : 'text-zinc-300 cursor-not-allowed'}`}
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
