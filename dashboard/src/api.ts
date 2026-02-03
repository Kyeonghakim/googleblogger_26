const API_BASE = import.meta.env.DEV ? 'http://localhost:8787' : '';

export const api = {
  get: async (path: string) => request(path, 'GET'),
  post: async (path: string, body?: any) => request(path, 'POST', body),
  put: async (path: string, body?: any) => request(path, 'PUT', body),
  delete: async (path: string) => request(path, 'DELETE'),
  createDraft: async (data: { title: string; content: string; contentType: string }) => request('/api/drafts', 'POST', data),
  generateMarketing: async (data: { topic: string; seoKeywords?: string }) => request('/api/generate-marketing', 'POST', data),
};

async function request(path: string, method: string, body?: any) {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(errorBody.error || response.statusText || `HTTP ${response.status}`);
  }

  return response.json();
}
