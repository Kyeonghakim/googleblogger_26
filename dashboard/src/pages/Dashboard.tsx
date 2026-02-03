import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Trash2, Inbox, FileText, Plus, Zap, X, Check, Loader2, Send } from 'lucide-react';
import { api } from '../api';

interface Draft {
  id: string;
  title: string;
  created_at: string;
  excerpt?: string;
  status?: 'pending' | 'approved' | 'published';
}

type AutoPublishStep = 'idle' | 'fetching' | 'generating' | 'preview' | 'publishing' | 'done' | 'error';

interface GeneratedDraft {
  id: number;
  title: string;
  content: string;
  preview: string;
}

interface PublishResult {
  url?: string;
}

function StepItem({ label, status }: { label: string; status: 'pending' | 'active' | 'completed' }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        status === 'completed' ? 'bg-zinc-900' : 
        status === 'active' ? 'bg-white border-2 border-zinc-900' : 
        'bg-zinc-100'
      }`}>
        {status === 'completed' ? (
          <Check className="w-4 h-4 text-white" />
        ) : status === 'active' ? (
          <Loader2 className="w-4 h-4 text-zinc-900 animate-spin" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-zinc-300" />
        )}
      </div>
      <span className={`text-sm font-medium ${
        status === 'completed' ? 'text-zinc-900' :
        status === 'active' ? 'text-zinc-900' :
        'text-zinc-400'
      }`}>
        {label}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoPublishStep, setAutoPublishStep] = useState<AutoPublishStep>('idle');
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedDraft | null>(null);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/drafts/${deleteTarget}`);
      setDeleteTarget(null);
      loadDrafts();
    } catch (err) {
      console.error('삭제 실패:', err);
      setDeleteTarget(null);
    }
  };

  const handleAutoGenerate = async () => {
    setShowModal(true);
    setAutoPublishStep('fetching');
    setGeneratedDraft(null);
    setPublishResult(null);
    setErrorMessage('');

    try {
      setTimeout(() => setAutoPublishStep('generating'), 2000);
      
      const result = await api.post('/api/auto-publish');
      
      if (result.success && result.draft) {
        setGeneratedDraft(result.draft);
        setAutoPublishStep('preview');
        loadDrafts();
      } else {
        throw new Error(result.error || '글 생성에 실패했습니다.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || '오류가 발생했습니다.');
      setAutoPublishStep('error');
    }
  };

  const handlePublish = async () => {
    if (!generatedDraft) return;
    
    setAutoPublishStep('publishing');
    
    try {
      const result = await api.post('/api/publish', { draftId: generatedDraft.id });
      
      if (result.success) {
        setPublishResult({ url: result.data?.url });
        setAutoPublishStep('done');
        loadDrafts();
      } else {
        throw new Error(result.error || '발행에 실패했습니다.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || '발행 중 오류가 발생했습니다.');
      setAutoPublishStep('error');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setAutoPublishStep('idle');
    setGeneratedDraft(null);
    setPublishResult(null);
    setErrorMessage('');
  };

  const getStepStatus = (targetStep: AutoPublishStep) => {
    const stepOrder: Record<AutoPublishStep, number> = { 
      idle: 0, fetching: 1, generating: 2, preview: 3, publishing: 4, done: 5, error: 5 
    };
    const currentOrder = stepOrder[autoPublishStep];
    const targetOrder = stepOrder[targetStep];
    
    if (currentOrder > targetOrder) return 'completed';
    if (currentOrder === targetOrder) return 'active';
    return 'pending';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'published':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 border border-zinc-100">
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">삭제 확인</h2>
            <p className="text-zinc-500 mb-6">정말 이 글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 px-4 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl mx-4 border border-zinc-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900">
                {autoPublishStep === 'preview' ? '미리보기' : '글 생성'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {(autoPublishStep === 'fetching' || autoPublishStep === 'generating') && (
              <div className="space-y-4 py-8">
                <StepItem label="YouTube 영상 수집" status={getStepStatus('fetching')} />
                <StepItem label="AI 글 생성" status={getStepStatus('generating')} />
              </div>
            )}

            {autoPublishStep === 'preview' && generatedDraft && (
              <div className="space-y-6">
                <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-200/50">
                  <h3 className="text-lg font-bold text-zinc-900 mb-4">{generatedDraft.title}</h3>
                  <div 
                    className="prose prose-zinc prose-sm max-w-none max-h-[400px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: generatedDraft.content }}
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 px-4 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors font-medium"
                  >
                    취소
                  </button>
                  <button
                    onClick={handlePublish}
                    className="flex-1 py-3 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    발행하기
                  </button>
                </div>
              </div>
            )}

            {autoPublishStep === 'publishing' && (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="w-10 h-10 text-zinc-900 animate-spin mb-4" />
                <p className="text-zinc-600 font-medium">블로그에 발행 중...</p>
              </div>
            )}

            {autoPublishStep === 'done' && (
              <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-emerald-700 font-bold text-lg mb-2">발행 완료!</p>
                <p className="text-sm text-zinc-600 mb-6">{generatedDraft?.title}</p>
                {publishResult?.url && (
                  <a 
                    href={publishResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-2.5 px-5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium shadow-sm"
                  >
                    블로그에서 보기 →
                  </a>
                )}
              </div>
            )}

            {autoPublishStep === 'error' && (
              <div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-6 h-6" />
                </div>
                <p className="text-red-700 font-bold text-lg">오류 발생</p>
                <p className="text-sm text-zinc-600 mt-2">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">대기 중인 글</h1>
          <p className="text-sm text-zinc-500 mt-1">발행 대기 중인 블로그 포스트를 관리하세요.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadDrafts} 
            className="p-2.5 border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleAutoGenerate}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            <Zap className="w-4 h-4" />
            자동 글 생성
          </button>
          <Link
            to="/new"
            className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            새 글 작성
          </Link>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-zinc-100 rounded-xl shadow-sm text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-1">대기 중인 글이 없습니다</h3>
          <p className="text-zinc-500 max-w-sm mx-auto">새로운 글을 작성하거나 자동 생성 기능을 사용하여 콘텐츠를 만들어보세요.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-100 rounded-xl shadow-sm divide-y divide-zinc-100 overflow-hidden">
          {drafts.map((draft) => (
            <div 
              key={draft.id} 
              className="p-5 hover:bg-zinc-50/50 transition-colors group flex items-center justify-between"
            >
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(draft.status)}`}>
                    {draft.status === 'pending' ? '대기중' : draft.status || '대기중'}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(draft.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Link 
                  to={`/drafts/${draft.id}`}
                  className="block group-hover:text-zinc-600 transition-colors"
                >
                  <h3 className="text-base font-semibold text-zinc-900 truncate pr-4 group-hover:text-indigo-600 transition-colors">
                    {draft.title}
                  </h3>
                  {draft.excerpt && (
                    <p className="text-sm text-zinc-500 mt-1 truncate">
                      {draft.excerpt}
                    </p>
                  )}
                </Link>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                   to={`/drafts/${draft.id}`}
                   className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                   title="수정"
                >
                  <FileText className="w-4 h-4" />
                </Link>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteTarget(draft.id);
                  }}
                  className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
