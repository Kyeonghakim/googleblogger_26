import type { Env } from '../types';

export interface PublishRequest {
  draftId: number;
  dryRun?: boolean;
}

export interface PublishResponse {
  success: boolean;
  message?: string;
  data?: any;
}

async function getAccessToken(env: Env): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: env.BLOGGER_CLIENT_ID,
      client_secret: env.BLOGGER_CLIENT_SECRET,
      refresh_token: env.BLOGGER_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // NEVER log the tokens themselves, but status and error text are fine provided they don't contain secrets
    throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
  }

  const data: any = await response.json();
  return data.access_token;
}

export async function publishToBlogger(env: Env, request: PublishRequest): Promise<PublishResponse> {
  try {
    // 1. Fetch draft
    const draft = await env.DB.prepare('SELECT * FROM drafts WHERE id = ?')
      .bind(request.draftId)
      .first<any>();

    if (!draft) {
      throw new Error(`Draft with ID ${request.draftId} not found`);
    }

    if (!draft.title || !draft.content) {
      throw new Error('Draft title or content is missing');
    }

    // 2. Handle dry run
    if (request.dryRun) {
      return {
        success: true,
        message: 'Dry run successful',
        data: {
          wouldPublish: true,
          title: draft.title,
          content: draft.content,
          blogId: env.BLOGGER_BLOG_ID,
        },
      };
    }

    // 3. Get access token
    const accessToken = await getAccessToken(env);

    // 4. Publish to Blogger
    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${env.BLOGGER_BLOG_ID}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: draft.title,
        content: draft.content,
        status: 'LIVE', 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to publish to Blogger: ${response.status} ${errorText}`);
    }

    const postData: any = await response.json();
    const bloggerPostId = postData.id;

    // 5. Update DB
    await env.DB.prepare("UPDATE drafts SET status = 'approved', updated_at = ? WHERE id = ?")
      .bind(Date.now(), request.draftId)
      .run();

    await env.DB.prepare('INSERT INTO publish_history (draft_id, blogger_post_id, published_at) VALUES (?, ?, ?)')
      .bind(request.draftId, bloggerPostId, Date.now())
      .run();

    return {
      success: true,
      message: 'Published successfully',
      data: {
        bloggerPostId,
        url: postData.url,
      },
    };

  } catch (error: any) {
    console.error('Publishing error:', error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}
