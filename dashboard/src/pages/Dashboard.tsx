import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Trash2, Inbox, FileText } from 'lucide-react';
import { api } from '../api';

interface Draft {
  id: string;
  title: string;
  created_at: string;
  excerpt?: string;
  status?: 'pending' | 'approved' | 'published';
}

export default function Dashboard() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/drafts');
      setDrafts(Array.isArray(data) ? data : data.drafts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'published':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">대기 중인 글</h1>
        <button 
          onClick={loadDrafts} 
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="새로고침"
        >
          <RefreshCw className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-100">
          <Inbox className="w-12 h-12 mb-4 text-slate-400" />
          <p>대기 중인 글이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div 
              key={draft.id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-slate-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link 
                    to={`/drafts/${draft.id}`}
                    className="block group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                        {draft.title}
                      </h3>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 pl-6">
                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(draft.status)}`}>
                      {draft.status || 'pending'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(draft.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button 
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
