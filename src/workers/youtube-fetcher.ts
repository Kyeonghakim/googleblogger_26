import { YoutubeTranscript } from 'youtube-transcript';
import type { Env, VideoInfo, TranscriptItem } from '../types';

const KEYWORDS = ["금리", "주식", "부동산", "투자", "경제", "Fed", "inflation", "S&P500"];
const MAX_VIDEOS_PER_KEYWORD = 2;
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

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
        const text = await response.text();
        console.error(`Response body: ${text}`);
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
          const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
          
          if (!transcriptData || transcriptData.length === 0) {
            console.log(`No transcript found for video ${videoId}`);
            continue;
          }

          const transcript: TranscriptItem[] = transcriptData.map(t => ({
            text: t.text,
            duration: t.duration,
            offset: t.offset
          }));

          collectedVideos.push({
            videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            transcript
          });
          
          console.log(`Collected video: ${item.snippet.title}`);

        } catch (transcriptError) {
          console.log(`Failed to fetch transcript for video ${videoId}: ${transcriptError}`);
        }
      }
    } catch (error) {
      console.error(`Error processing keyword ${keyword}:`, error);
    }
  }

  return collectedVideos;
}
