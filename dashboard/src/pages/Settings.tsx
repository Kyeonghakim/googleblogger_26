import { useEffect, useState } from 'react';
import { api } from '../api';
import { Settings as SettingsIcon, Check, BookOpen, Zap, PenTool, Image, Clock } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    youtubeChannelId: '',
    seoKeywords: '',
    marketing_target: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.get('/api/settings');
      setSettings({
        youtubeChannelId: data.youtubeChannelId || '',
        seoKeywords: data.seoKeywords || '',
        marketing_target: data.marketing_target || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.post('/api/settings', settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('설정 저장 실패');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-zinc-500">로딩 중...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-zinc-900" />
        <h1 className="text-2xl font-semibold text-zinc-900">설정</h1>
      </div>

      <div className="bg-white border border-zinc-100 rounded-xl p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-zinc-900" />
          사용 가이드
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-violet-600" />
              <h3 className="font-medium text-zinc-900">자동 글 생성 (홈)</h3>
            </div>
            <p className="text-sm text-zinc-500">
              홈 화면에서 "자동 글 생성" 버튼 클릭 → YouTube 영상 수집 → AI가 글 작성 → 미리보기 확인 후 발행
            </p>
          </div>

          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-zinc-900">이미지 기반 글 생성</h3>
            </div>
            <p className="text-sm text-zinc-500">
              새 글 → AI 마케팅 글 생성 → 홍보할 제품/서비스 이미지 업로드 → AI가 이미지 분석 후 마케팅 글 작성
            </p>
          </div>

          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
            <div className="flex items-center gap-2 mb-2">
              <PenTool className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-zinc-900">핫이슈 글 생성</h3>
            </div>
            <p className="text-sm text-zinc-500">
              새 글 → AI 마케팅 글 생성 → 이미지 없이 "핫이슈 글 생성" 클릭 → AI가 오늘의 트렌드 주제로 글 작성
            </p>
          </div>

          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <h3 className="font-medium text-zinc-900">자동 스케줄링</h3>
            </div>
            <p className="text-sm text-zinc-500">
              매일 오전 9시, 오후 3시에 자동으로 YouTube 영상 기반 글이 생성됩니다. (설정 필요 없음)
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-zinc-100 rounded-xl p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">기본 설정</h2>
        
        {success && (
          <div className="bg-green-50 text-green-700 border border-green-100 rounded-xl p-4 text-sm font-medium">
            설정이 저장되었습니다.
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">YouTube 채널</label>
          <input 
            value={settings.youtubeChannelId}
            onChange={(e) => setSettings({ ...settings, youtubeChannelId: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all bg-white text-zinc-900 placeholder:text-zinc-400"
            placeholder="채널 ID 또는 이름"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">기본 포함 단어</label>
          <input 
            value={settings.seoKeywords}
            onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all bg-white text-zinc-900 placeholder:text-zinc-400"
            placeholder="쉼표로 구분 (예: 주식, 부동산, 재테크)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            마케팅 대상 정보
            <span className="text-xs text-zinc-400 ml-2 font-normal">(AI 마케팅 글에 자동 반영)</span>
          </label>
          <textarea 
            value={settings.marketing_target}
            onChange={(e) => setSettings({ ...settings, marketing_target: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-all bg-white text-zinc-900 placeholder:text-zinc-400 resize-none"
            rows={4}
            placeholder="홍보할 제품/서비스 정보를 입력하세요. 예: 모바일 소액결제 서비스, 간편한 휴대폰 결제 시스템..."
          />
        </div>
        
        <div className="pt-4 border-t border-zinc-100">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl px-6 py-2.5 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {saving ? (
              <span>저장 중...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                저장
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
