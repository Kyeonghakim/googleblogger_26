import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

interface Draft {
  id: string;
  title: string;
  created_at: string;
  excerpt?: string;
}

export default function Dashboard() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const data = await api.get('/api/drafts');
      setDrafts(data.drafts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">로딩 중...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">대기 중인 글</h2>
      {drafts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
          대기 중인 글이 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {drafts.map((draft) => (
              <li key={draft.id}>
                <Link
                  to={`/drafts/${draft.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{draft.title}</h3>
                      <p className="text-sm text-gray-500">{new Date(draft.created_at).toLocaleString()}</p>
                    </div>
                    <span className="text-blue-600 text-sm font-medium">검토하기 &rarr;</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
