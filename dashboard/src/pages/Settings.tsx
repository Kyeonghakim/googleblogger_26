import { useEffect, useState } from 'react';
import { api } from '../api';
import { Settings as SettingsIcon, Check } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    youtubeChannelId: '',
    seoKeywords: '',
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

  if (loading) return <div className="p-8 text-slate-500">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-slate-600" />
        <h1 className="text-2xl font-semibold text-slate-900">설정</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {success && (
          <div className="bg-green-50 text-green-800 rounded-lg p-4">
            설정이 저장되었습니다.
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">YouTube 채널</label>
          <input 
            value={settings.youtubeChannelId}
            onChange={(e) => setSettings({ ...settings, youtubeChannelId: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="채널 ID 또는 이름"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">SEO 키워드</label>
          <input 
            value={settings.seoKeywords}
            onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="쉼표로 구분"
          />
        </div>
        
        <div className="pt-4 border-t border-slate-200">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
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
