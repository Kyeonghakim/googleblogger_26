import { fetchVideos } from './youtube-fetcher';
import { generatePost } from './ai-generator';
import type { Env } from '../types';

export async function runScheduledJob(env: Env) {
  console.log('Running scheduled job...');

  try {
    const videos = await fetchVideos(env);
    console.log(`Fetched ${videos.length} new videos.`);

    if (videos.length === 0) {
      console.log('No new videos to process.');
      return;
    }

    const video = videos[0];
    if (!video) {
      console.log('No video available.');
      return;
    }
    console.log(`Processing video: ${video.title} (${video.videoId})`);

    const hour = new Date().getUTCHours();
    const contentType = hour === 0 ? 'informational' : 'promotional';

    const result = await generatePost({
      videoId: video.videoId,
      contentType: contentType,
      seoKeywords: '금리, 주식, 부동산, 투자, 경제'
    }, env);

    console.log(`Successfully generated post: ${result.title} (Draft ID: ${result.draftId})`);
  } catch (error) {
    console.error('Error in scheduled job:', error);
  }
}
