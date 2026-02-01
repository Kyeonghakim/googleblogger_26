import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Settings() {
  const [settings, setSettings] = useState({
    defaultContentType: 'blog',
    seoKeywords: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.get('/api/settings');
      setSettings({
        defaultContentType: data.defaultContentType || 'blog',
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
    try {
      await api.put('/api/settings', settings);
      alert('설정이 저장되었습니다.');
    } catch (err) {
      alert('설정 저장 실패');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-500">로딩 중...</div>;

  return (
    <div className="max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">설정</h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">기본 콘텐츠 타입</label>
          <select
            value={settings.defaultContentType}
            onChange={(e) => setSettings({ ...settings, defaultContentType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="blog">블로그</option>
            <option value="news">뉴스</option>
            <option value="essay">에세이</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO 기본 키워드 (쉼표로 구분)</label>
          <input
            type="text"
            value={settings.seoKeywords}
            onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 기술, 개발, 리액트"
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
