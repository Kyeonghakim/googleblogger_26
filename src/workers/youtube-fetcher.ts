import type { Env, VideoInfo } from '../types';

const KEYWORDS = ["재테크", "주식 투자", "부동산 전망", "경제 뉴스", "ETF 추천", "미국 주식", "절세", "금융 상식"];
const MAX_VIDEOS_PER_KEYWORD = 2;
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const VIDEO_DETAILS_URL = 'https://www.googleapis.com/youtube/v3/videos';

export async function fetchVideos(env: Env): Promise<VideoInfo[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const collectedVideos: VideoInfo[] = [];
  const processedVideoIds = new Set<string>();

  console.log(`Starting video fetch for keywords: ${KEYWORDS.join(', ')}`);

  for (const keyword of KEYWORDS) {
    try {
      const url = new URL(SEARCH_URL);
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('q', keyword);
      url.searchParams.append('type', 'video');
      url.searchParams.append('order', 'viewCount');
      url.searchParams.append('publishedAfter', sevenDaysAgo);
      url.searchParams.append('maxResults', MAX_VIDEOS_PER_KEYWORD.toString());
      url.searchParams.append('key', env.YOUTUBE_API_KEY);

      const response = await fetch(url.toString());
      if (!response.ok) {
        console.error(`YouTube API error for keyword ${keyword}: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json() as any;
      if (!data.items) continue;

      for (const item of data.items) {
        const videoId = item.id.videoId;

        if (processedVideoIds.has(videoId)) continue;
        processedVideoIds.add(videoId);

        const existing = await env.DB.prepare('SELECT source_video_id FROM drafts WHERE source_video_id = ?')
          .bind(videoId)
          .first();

        if (existing) {
          console.log(`Skipping video ${videoId} (already in drafts)`);
          continue;
        }

        try {
          const details = await getVideoDetails(videoId, env.YOUTUBE_API_KEY);

          if (!details.description || details.description.length < 100) {
            console.log(`Skipping video ${videoId} (description too short)`);
            continue;
          }

          collectedVideos.push({
            videoId,
            title: details.title || item.snippet.title,
            description: details.description || item.snippet.description,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
          });

          console.log(`Collected video: ${details.title || item.snippet.title}`);

          if (collectedVideos.length >= 2) {
            return collectedVideos;
          }

        } catch (detailsError) {
          console.log(`Failed to fetch details for video ${videoId}: ${detailsError}`);
        }
      }
    } catch (error) {
      console.error(`Error processing keyword ${keyword}:`, error);
    }
  }

  return collectedVideos;
}

async function getVideoDetails(videoId: string, apiKey: string): Promise<{ title: string; description: string }> {
  const url = new URL(VIDEO_DETAILS_URL);
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('id', videoId);
  url.searchParams.append('key', apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json() as any;
  const item = data.items?.[0];

  if (!item) {
    throw new Error('Video not found');
  }

  return {
    title: item.snippet.title || '',
    description: item.snippet.description || '',
  };
}
