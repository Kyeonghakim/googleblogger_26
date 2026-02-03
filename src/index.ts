import { fetchVideos } from './workers/youtube-fetcher';
import { generatePost, generateMarketingPost, generateFromImage, type GeneratePostRequest, type GenerateMarketingRequest, type GenerateFromImageRequest } from './workers/ai-generator';
import { publishToBlogger, type PublishRequest } from './workers/blogger-publisher';
import { runScheduledJob } from './workers/scheduled';
import { createToken, verifyAuth } from './middleware/auth';
import type { Env } from './types';
import type { ExecutionContext, ScheduledEvent } from '@cloudflare/workers-types';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/login' && request.method === 'POST') {
      try {
        const body = await request.json() as { password?: string };
        if (env.DASHBOARD_PASSWORD && body.password === env.DASHBOARD_PASSWORD) {
          const token = await createToken(env);
          return new Response(JSON.stringify({ token }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ error: 'Invalid password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/logout' && request.method === 'POST') {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/oauth/start') {
      const redirectUri = `${url.origin}/oauth/callback`;
      const scope = 'https://www.googleapis.com/auth/blogger';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${env.BLOGGER_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scope)}` +
        `&access_type=offline` +
        `&prompt=consent`;
      
      return Response.redirect(authUrl, 302);
    }

    if (url.pathname === '/oauth/callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        return new Response(`OAuth Error: ${error}`, { status: 400 });
      }

      if (!code) {
        return new Response('Missing authorization code', { status: 400 });
      }

      try {
        const redirectUri = `${url.origin}/oauth/callback`;
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: env.BLOGGER_CLIENT_ID,
            client_secret: env.BLOGGER_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          const errText = await tokenResponse.text();
          return new Response(`Token exchange failed: ${errText}`, { status: 500 });
        }

        const tokenData: any = await tokenResponse.json();
        
        const blogsResponse = await fetch('https://www.googleapis.com/blogger/v3/users/self/blogs', {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
        });

        let blogsHtml = '';
        if (blogsResponse.ok) {
          const blogsData: any = await blogsResponse.json();
          if (blogsData.items && blogsData.items.length > 0) {
            blogsHtml = '<h3>Your Blogs:</h3><ul>' + 
              blogsData.items.map((b: any) => `<li><strong>${b.name}</strong> - BLOG_ID: <code>${b.id}</code></li>`).join('') +
              '</ul>';
          }
        }

        return new Response(`
          <html>
            <head><title>OAuth Success</title></head>
            <body style="font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px;">
              <h1>✅ OAuth 인증 성공!</h1>
              <h2>BLOGGER_REFRESH_TOKEN:</h2>
              <textarea style="width: 100%; height: 100px; font-family: monospace;">${tokenData.refresh_token || 'No refresh token (already authorized before)'}</textarea>
              ${blogsHtml}
              <h3>.dev.vars에 추가:</h3>
              <pre style="background: #f5f5f5; padding: 15px; overflow-x: auto;">
BLOGGER_REFRESH_TOKEN=${tokenData.refresh_token || '(기존 토큰 사용)'}
BLOGGER_BLOG_ID=${blogsResponse.ok ? '(위에서 선택)' : '(수동 입력 필요)'}
              </pre>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

      } catch (e: any) {
        return new Response(`OAuth Error: ${e.message}`, { status: 500 });
      }
    }

    if (url.pathname.startsWith('/api/')) {
      const isAuthenticated = await verifyAuth(request, env);
      if (!isAuthenticated) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/drafts' && request.method === 'GET') {
      try {
        const status = url.searchParams.get('status') || 'pending';
        const drafts = await env.DB.prepare('SELECT * FROM drafts WHERE status = ? ORDER BY created_at DESC')
          .bind(status)
          .all();
        return new Response(JSON.stringify(drafts.results), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/drafts' && request.method === 'POST') {
      try {
        const body = await request.json() as { title: string; content: string; contentType?: string };
        if (!body.title || !body.content) {
          return new Response(JSON.stringify({ error: 'Missing title or content' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        const now = Date.now();
        const result = await env.DB.prepare(`
          INSERT INTO drafts (title, content, content_type, status, created_at, updated_at)
          VALUES (?, ?, ?, 'pending', ?, ?)
        `)
          .bind(body.title, body.content, body.contentType || 'informational', now, now)
          .run();
        return new Response(JSON.stringify({ 
          success: true, 
          draftId: result.meta.last_row_id,
          title: body.title 
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname.match(/^\/api\/drafts\/\d+$/) && request.method === 'GET') {
      try {
        const id = url.pathname.split('/').pop();
        const draft = await env.DB.prepare('SELECT * FROM drafts WHERE id = ?')
          .bind(id)
          .first();
        if (!draft) {
          return new Response(JSON.stringify({ error: 'Draft not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify(draft), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname.match(/^\/api\/drafts\/\d+$/) && request.method === 'PUT') {
      try {
        const id = url.pathname.split('/').pop();
        const body = await request.json() as { title?: string; content?: string; status?: string };
        await env.DB.prepare('UPDATE drafts SET title = COALESCE(?, title), content = COALESCE(?, content), status = COALESCE(?, status), updated_at = ? WHERE id = ?')
          .bind(body.title || null, body.content || null, body.status || null, Date.now(), id)
          .run();
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname.match(/^\/api\/drafts\/\d+$/) && request.method === 'DELETE') {
      try {
        const id = url.pathname.split('/').pop();
        await env.DB.prepare('DELETE FROM drafts WHERE id = ?')
          .bind(id)
          .run();
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/settings' && request.method === 'GET') {
      try {
        const settings = await env.DB.prepare('SELECT * FROM settings').all();
        const result: Record<string, string> = {};
        for (const row of settings.results as any[]) {
          result[row.key] = row.value;
        }
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/settings' && request.method === 'POST') {
      try {
        const body = await request.json() as Record<string, string>;
        for (const [key, value] of Object.entries(body)) {
          await env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
            .bind(key, value)
            .run();
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/history' && request.method === 'GET') {
      try {
        const history = await env.DB.prepare(`
          SELECT ph.*, d.title, d.content 
          FROM publish_history ph 
          JOIN drafts d ON ph.draft_id = d.id 
          ORDER BY ph.published_at DESC
        `).all();
        return new Response(JSON.stringify(history.results), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/run-scheduled' && request.method === 'POST') {
      try {
        await runScheduledJob(env);
        return new Response(JSON.stringify({ success: true, message: 'Scheduled job completed' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/fetch-videos') {
      if (!env.YOUTUBE_API_KEY) {
        return new Response(JSON.stringify({ error: 'Missing YOUTUBE_API_KEY' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const videos = await fetchVideos(env);
        return new Response(JSON.stringify(videos, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/generate-post' && request.method === 'POST') {
      if (!env.AI || !env.YOUTUBE_API_KEY) {
        return new Response(JSON.stringify({ error: 'Missing AI binding or YOUTUBE_API_KEY' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const body = await request.json() as { videoId?: string; contentType?: string; seoKeywords?: string };

        if (!body.videoId || !body.contentType) {
          return new Response(JSON.stringify({ error: 'Missing videoId or contentType' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const videoDetailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
        videoDetailsUrl.searchParams.append('part', 'snippet');
        videoDetailsUrl.searchParams.append('id', body.videoId);
        videoDetailsUrl.searchParams.append('key', env.YOUTUBE_API_KEY);

        const videoResponse = await fetch(videoDetailsUrl.toString());
        if (!videoResponse.ok) {
          throw new Error(`YouTube API error: ${videoResponse.status}`);
        }

        const videoData = await videoResponse.json() as any;
        const videoItem = videoData.items?.[0];

        if (!videoItem) {
          return new Response(JSON.stringify({ error: 'Video not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const generateRequest: GeneratePostRequest = {
          videoId: body.videoId,
          videoTitle: videoItem.snippet.title || '',
          videoDescription: videoItem.snippet.description || '',
          contentType: body.contentType as 'informational' | 'promotional',
          seoKeywords: body.seoKeywords,
        };

        const result = await generatePost(generateRequest, env);
        return new Response(JSON.stringify(result, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/publish' && request.method === 'POST') {
      if (!env.BLOGGER_CLIENT_ID || !env.BLOGGER_CLIENT_SECRET || !env.BLOGGER_REFRESH_TOKEN || !env.BLOGGER_BLOG_ID) {
        return new Response(JSON.stringify({ error: 'Missing Blogger credentials' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const body = await request.json() as PublishRequest;

        if (!body.draftId) {
          return new Response(JSON.stringify({ error: 'Missing draftId' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const result = await publishToBlogger(env, body);
        return new Response(JSON.stringify(result, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/auto-publish' && request.method === 'POST') {
      if (!env.AI || !env.YOUTUBE_API_KEY) {
        return new Response(JSON.stringify({ error: 'Missing AI binding or YOUTUBE_API_KEY' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const videos = await fetchVideos(env);
        if (!videos || videos.length === 0) {
          return new Response(JSON.stringify({ error: 'No videos found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const randomIndex = Math.floor(Math.random() * Math.min(videos.length, 5));
        const selectedVideo = videos[randomIndex]!;

        const generateRequest: GeneratePostRequest = {
          videoId: selectedVideo.videoId,
          videoTitle: selectedVideo.title,
          videoDescription: selectedVideo.description,
          contentType: 'informational',
        };

        const generateResult = await generatePost(generateRequest, env);

        const draft = await env.DB.prepare('SELECT * FROM drafts WHERE id = ?')
          .bind(generateResult.draftId)
          .first();

        return new Response(JSON.stringify({
          success: true,
          draft: {
            id: generateResult.draftId,
            title: generateResult.title,
            content: draft?.content || generateResult.preview,
            preview: generateResult.preview,
          },
          video: { videoId: selectedVideo.videoId, title: selectedVideo.title },
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/generate-marketing' && request.method === 'POST') {
      if (!env.AI) {
        return new Response(JSON.stringify({ error: 'Missing AI binding' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const body = await request.json() as { topic?: string; seoKeywords?: string };

        const marketingRequest: GenerateMarketingRequest = {
          topic: body.topic,
          seoKeywords: body.seoKeywords,
        };

        const marketingTargetSetting = await env.DB.prepare("SELECT value FROM settings WHERE key = 'marketing_target'").first() as { value: string } | null;
        const marketingTarget = marketingTargetSetting?.value;

        const result = await generateMarketingPost(marketingRequest, env, marketingTarget);
        return new Response(JSON.stringify(result, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/generate-from-image' && request.method === 'POST') {
      if (!env.AI) {
        return new Response(JSON.stringify({ error: 'Missing AI binding' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const body = await request.json() as { imageBase64: string; imageMimeType: string; seoKeywords?: string };

        if (!body.imageBase64 || !body.imageMimeType) {
          return new Response(JSON.stringify({ error: 'Missing image data' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const imageRequest: GenerateFromImageRequest = {
          imageBase64: body.imageBase64,
          imageMimeType: body.imageMimeType,
          seoKeywords: body.seoKeywords,
        };

        const marketingTargetSetting = await env.DB.prepare("SELECT value FROM settings WHERE key = 'marketing_target'").first() as { value: string } | null;
        const marketingTarget = marketingTargetSetting?.value;

        const result = await generateFromImage(imageRequest, env, marketingTarget);
        return new Response(JSON.stringify(result, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Serve static assets (Dashboard)
    if (env.ASSETS) {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404 && !url.pathname.startsWith('/api/')) {
        // SPA Fallback: Serve index.html for unknown non-API routes
        return await env.ASSETS.fetch(new Request(new URL('/index.html', request.url).toString(), request));
      }
      return response;
    }

    return new Response('Hello, Google Blogger Automation!');
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runScheduledJob(env));
  },
};
