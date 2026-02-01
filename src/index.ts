import { fetchVideos } from './workers/youtube-fetcher';
import { generatePost, type GeneratePostRequest } from './workers/ai-generator';
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

    if (url.pathname.startsWith('/api/')) {
      const isAuthenticated = await verifyAuth(request, env);
      if (!isAuthenticated) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
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
      if (!env.GEMINI_API_KEY || !env.YOUTUBE_API_KEY) {
         return new Response(JSON.stringify({ error: 'Missing API Keys' }), {
           status: 500,
           headers: { 'Content-Type': 'application/json' },
         });
      }

      try {
        const body = await request.json() as GeneratePostRequest;
        
        if (!body.videoId || !body.contentType) {
          return new Response(JSON.stringify({ error: 'Missing videoId or contentType' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const result = await generatePost(body, env);
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

    return new Response('Hello World!');
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runScheduledJob(env));
  },
};
