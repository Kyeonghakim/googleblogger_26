import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { PenTool, Sparkles, Loader2, AlertCircle, Upload, Image, X } from 'lucide-react';

export default function NewPost() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'direct' | 'ai'>('direct');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [directForm, setDirectForm] = useState({
    title: '',
    content: '',
    contentType: 'informational' as 'informational' | 'promotional'
  });

  const [aiForm, setAiForm] = useState({
    seoKeywords: '',
    imageFile: null as File | null,
    imagePreview: ''
  });

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/drafts', directForm);
      const newDraftId = response.draftId || response.id || response.draft?.id;
      if (newDraftId) {
        navigate(`/drafts/${newDraftId}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(`글 작성 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }
      setAiForm({ ...aiForm, imageFile: file, imagePreview: URL.createObjectURL(file) });
      setError(null);
    }
  };

  const removeImage = () => {
    setAiForm({ ...aiForm, imageFile: null, imagePreview: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (aiForm.imageFile) {
        const imageBase64 = await fileToBase64(aiForm.imageFile);
        response = await api.post('/api/generate-from-image', {
          imageBase64,
          imageMimeType: aiForm.imageFile.type,
          seoKeywords: aiForm.seoKeywords
        });
      } else {
        response = await api.post('/api/generate-marketing', {
          seoKeywords: aiForm.seoKeywords
        });
      }
      
      const newDraftId = response.draftId || response.id || response.draft?.id;
      if (newDraftId) {
        navigate(`/drafts/${newDraftId}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(`AI 글 생성 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass rounded-xl overflow-hidden">
        <div className="flex border-b border-white/[0.08]">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-premium ${
              activeTab === 'direct'
                ? 'text-accent border-b-2 border-accent'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
            }`}
          >
            <PenTool className="w-4 h-4" />
            직접 작성
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-premium ${
              activeTab === 'ai'
                ? 'text-accent border-b-2 border-accent'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI 마케팅 글 생성
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-error-muted border border-error/20 rounded-xl flex items-center gap-3 text-error">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {activeTab === 'direct' ? (
            <form onSubmit={handleDirectSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  required
                  value={directForm.title}
                  onChange={(e) => setDirectForm({ ...directForm, title: e.target.value })}
                  className="w-full px-4 py-3 input-glass rounded-xl outline-none"
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  글 유형
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="contentType"
                      value="informational"
                      checked={directForm.contentType === 'informational'}
                      onChange={(e) => setDirectForm({ ...directForm, contentType: e.target.value as 'informational' | 'promotional' })}
                      className="text-accent focus:ring-accent bg-transparent border-white/20"
                    />
                    <span className="text-zinc-300 group-hover:text-zinc-100 transition-colors">정보성 (기본)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="contentType"
                      value="promotional"
                      checked={directForm.contentType === 'promotional'}
                      onChange={(e) => setDirectForm({ ...directForm, contentType: e.target.value as 'informational' | 'promotional' })}
                      className="text-accent focus:ring-accent bg-transparent border-white/20"
                    />
                    <span className="text-zinc-300 group-hover:text-zinc-100 transition-colors">홍보성</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  내용 (HTML 지원)
                </label>
                <textarea
                  required
                  value={directForm.content}
                  onChange={(e) => setDirectForm({ ...directForm, content: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-3 input-glass rounded-xl outline-none font-mono text-sm"
                  placeholder="<p>내용을 입력하세요...</p>"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  작성 완료
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAiSubmit} className="space-y-6">
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-accent mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI 마케팅 글 생성기
                </h3>
                <p className="text-sm text-accent/80">
                  홍보할 제품/서비스 이미지를 올리면 AI가 분석해서 마케팅 글을 작성합니다. 이미지 없이도 핫이슈 주제로 글을 생성할 수 있습니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  홍보할 제품/서비스 이미지 (선택)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                {aiForm.imagePreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={aiForm.imagePreview} 
                      alt="미리보기" 
                      className="max-h-48 rounded-xl border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-400 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-white/10 rounded-xl hover:border-accent/50 hover:bg-accent/5 transition-all flex flex-col items-center gap-2 text-zinc-400 hover:text-accent"
                  >
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">클릭하여 제품/서비스 이미지 업로드</span>
                    <span className="text-xs text-zinc-500">이미지가 없으면 AI가 오늘의 핫이슈로 글을 작성합니다</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  포함할 단어 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={aiForm.seoKeywords}
                  onChange={(e) => setAiForm({ ...aiForm, seoKeywords: e.target.value })}
                  className="w-full px-4 py-3 input-glass rounded-xl outline-none"
                  placeholder="예: 주식, 부동산, 적금"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      {aiForm.imageFile ? <Image className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      {aiForm.imageFile ? '이미지 기반 글 생성' : '핫이슈 글 생성'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
