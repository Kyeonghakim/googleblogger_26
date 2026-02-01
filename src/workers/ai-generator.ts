import { YoutubeTranscript } from 'youtube-transcript';
import type { Env } from '../types';

export interface GeneratePostRequest {
  videoId: string;
  contentType: 'informational' | 'promotional';
  seoKeywords?: string;
}

interface GeneratePostResult {
  draftId: number;
  title: string;
  preview: string;
}

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

async function fetchVideoTitle(videoId: string, apiKey: string): Promise<string> {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch video details: ${response.statusText}`);
  }
  const data = await response.json() as any;
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }
  return data.items[0].snippet.title;
}

async function fetchTranscript(videoId: string): Promise<string> {
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    return transcriptItems.map(item => item.text).join(' ');
  } catch (error) {
    throw new Error(`Failed to fetch transcript: ${error}`);
  }
}

async function generateContentWithGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt + "\n\n" + userPrompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4000,
    }
  };

  let attempt = 0;
  let lastError: any;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.status === 429) {
        throw new Error('Quota exceeded');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data = await response.json() as any;
      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
         throw new Error('No content generated');
      }

      return data.candidates[0].content.parts[0].text;

    } catch (error: any) {
      lastError = error;
      
      attempt++;
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1)));
      }
    }
  }

  throw lastError;
}

export async function generatePost(
  request: GeneratePostRequest,
  env: Env
): Promise<GeneratePostResult> {
  const { videoId, contentType, seoKeywords = '' } = request;

  const [videoTitle, transcriptText] = await Promise.all([
    fetchVideoTitle(videoId, env.YOUTUBE_API_KEY),
    fetchTranscript(videoId)
  ]);

  const systemPrompt = await Bun.file('src/prompts/system.txt').text();
  const templateFilename = contentType === 'informational' ? 'informational.txt' : 'promotional.txt';
  const templatePrompt = await Bun.file(`src/prompts/${templateFilename}`).text();

  const fullPrompt = templatePrompt
    .replace('{{VIDEO_TITLE}}', videoTitle)
    .replace('{{VIDEO_TRANSCRIPT}}', transcriptText)
    .replace('{{SEO_KEYWORDS}}', seoKeywords);

  const generatedContent = await generateContentWithGemini(env.GEMINI_API_KEY, systemPrompt, fullPrompt);

  const now = new Date().toISOString();
  
  let blogTitle = videoTitle;
  const blogContent = generatedContent;
  
  const titleMatch = generatedContent.match(/^\[제목:\s*(.*?)\]/m);
  if (titleMatch && titleMatch[1]) {
    blogTitle = titleMatch[1];
  }

  const { results } = await env.DB.prepare(`
    INSERT INTO drafts (title, content, source_video_url, source_video_id, content_type, seo_keywords, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    RETURNING id
  `)
  .bind(
    blogTitle,
    blogContent,
    `https://www.youtube.com/watch?v=${videoId}`,
    videoId,
    contentType,
    seoKeywords,
    now,
    now
  )
  .run();

  const draftId = (results[0] as any).id as number;

  return {
    draftId,
    title: blogTitle,
    preview: blogContent.substring(0, 200) + '...'
  };
}
