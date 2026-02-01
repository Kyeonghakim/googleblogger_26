import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function DraftDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) loadDraft(id);
  }, [id]);

  const loadDraft = async (draftId: string) => {
    try {
      const data = await api.get(`/api/drafts/${draftId}`);
      setDraft(data);
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
      await api.put(`/api/drafts/${id}`, { ...draft, content });
      alert('저장되었습니다.');
    } catch (err) {
      alert('저장 실패');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('이 글을 발행하시겠습니까?')) return;
    setProcessing(true);
    try {
      await api.post('/api/publish', { id });
      navigate('/');
    } catch (err) {
      alert('발행 실패');
    } finally {
      setProcessing(false);
    }
  };

      const handleReject = async () => {
      if (!confirm('이 글을 거절하시겠습니까?')) return;
      setProcessing(true);
      try {
          await api.put(`/api/drafts/${id}`, { ...draft, status: 'rejected' });
          navigate('/');
      } catch (err) {
          alert('거절 처리 실패');
      } finally {
          setProcessing(false);
      }
  };

  if (loading) return <div className="text-gray-500">로딩 중...</div>;
  if (!draft) return <div className="text-gray-500">글을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{draft.title}</h2>
        <div className="space-x-2">
            <button
            onClick={handleReject}
            disabled={processing}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 cursor-pointer disabled:opacity-50"
            >
            거절
            </button>
            <button
            onClick={handleApprove}
            disabled={processing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:opacity-50"
            >
            승인 및 발행
            </button>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">내용 편집</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={processing}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 mr-2 cursor-pointer disabled:opacity-50"
        >
          임시 저장
        </button>
      </div>
    </div>
  );
}
