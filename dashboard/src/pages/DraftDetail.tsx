import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ArrowLeft, Save, Send, Trash2 } from 'lucide-react';

export default function DraftDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) loadDraft(id);
  }, [id]);

  const loadDraft = async (draftId: string) => {
    try {
      const data = await api.get(`/api/drafts/${draftId}`);
      setDraft(data);
      setTitle(data.title || '');
      setContent(data.content || '');
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setProcessing(true);
    try {
      await api.put(`/api/drafts/${id}`, { ...draft, title, content });
      alert('저장되었습니다.');
    } catch (err) {
      alert('저장 실패');
    } finally {
      setProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('이 글을 발행하시겠습니까?')) return;
    setProcessing(true);
    try {
      await api.post('/api/publish', { draftId: Number(id) });
      navigate('/');
    } catch (err) {
      alert('발행 실패');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setProcessing(true);
    try {
      await api.delete(`/api/drafts/${id}`);
      navigate('/');
    } catch (err) {
      alert('삭제 실패');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-gray-500 p-8">로딩 중...</div>;
  if (!draft) return <div className="text-gray-500 p-8">글을 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-2xl font-semibold text-slate-900">글 수정</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">제목</label>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">내용</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12} 
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-sm transition-shadow resize-y"
          />
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button 
            onClick={handleDelete}
            disabled={processing}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={processing}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
            <button 
              onClick={handlePublish}
              disabled={processing}
              className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              발행
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
