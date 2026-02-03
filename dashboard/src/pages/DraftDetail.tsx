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
      alert('발행 완료! 블로그에 게시되었습니다.');
      navigate('/');
    } catch (err: any) {
      alert(`발행 실패: ${err.message || '알 수 없는 오류'}`);
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

  if (loading) return <div className="text-zinc-500 p-8 text-center">로딩 중...</div>;
  if (!draft) return <div className="text-zinc-500 p-8 text-center">글을 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </button>
        <h1 className="text-2xl font-semibold text-zinc-900">글 수정</h1>
      </div>
      
      <div className="bg-white border border-zinc-100 rounded-xl p-8 shadow-sm space-y-8">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-500">제목</label>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-0 py-3 text-2xl font-semibold text-zinc-900 placeholder-zinc-300 border-b border-zinc-200 focus:border-zinc-900 focus:outline-none transition-colors bg-transparent"
            placeholder="제목을 입력하세요"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-500">내용</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15} 
            className="w-full p-4 rounded-xl border border-zinc-200 text-zinc-700 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-zinc-100 transition-all font-sans text-base"
            placeholder="내용을 작성하세요..."
          />
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
          <button 
            onClick={handleDelete}
            disabled={processing}
            className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 font-medium text-sm"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={processing}
              className="px-5 py-2.5 text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 font-medium text-sm shadow-sm"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
            <button 
              onClick={handlePublish}
              disabled={processing}
              className="px-5 py-2.5 text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 font-medium text-sm shadow-sm hover:shadow-md"
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
