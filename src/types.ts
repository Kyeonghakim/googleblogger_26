import type { D1Database } from '@cloudflare/workers-types';

export interface VideoInfo {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  transcript?: TranscriptItem[];
}

export interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
}

export interface Env {
  DB: D1Database;
  YOUTUBE_API_KEY: string;
  GEMINI_API_KEY: string;
  BLOGGER_CLIENT_ID: string;
  BLOGGER_CLIENT_SECRET: string;
  BLOGGER_REFRESH_TOKEN: string;
  BLOGGER_BLOG_ID: string;
  DASHBOARD_PASSWORD?: string;
  JWT_SECRET?: string;
}
