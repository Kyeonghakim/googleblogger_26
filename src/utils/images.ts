const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';

export interface ImageResult {
  url: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

export async function searchUnsplashImages(
  query: string,
  accessKey: string,
  count: number = 3
): Promise<ImageResult[]> {
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.append('query', query);
  url.searchParams.append('per_page', count.toString());
  url.searchParams.append('orientation', 'landscape');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Client-ID ${accessKey}`,
    },
  });

  if (!response.ok) {
    console.error(`Unsplash API error: ${response.status}`);
    return [];
  }

  const data = await response.json() as any;
  
  return (data.results || []).map((photo: any) => ({
    url: photo.urls?.regular || photo.urls?.small,
    alt: photo.alt_description || query,
    photographer: photo.user?.name || 'Unknown',
    photographerUrl: photo.user?.links?.html || 'https://unsplash.com',
  }));
}

export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'maxres'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault', 
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

export function insertImagesIntoContent(
  htmlContent: string,
  images: ImageResult[],
  videoId: string
): string {
  const thumbnail = getYouTubeThumbnail(videoId, 'maxres');
  
  const heroImageHtml = `
<figure style="margin: 0 0 2em 0;">
  <img src="${thumbnail}" alt="영상 썸네일" style="width: 100%; height: auto; border-radius: 8px;" />
</figure>
`;

  let result = heroImageHtml + htmlContent;
  let insertCount = 0;

  const h2Matches = result.match(/<h2[^>]*>.*?<\/h2>/gi) || [];
  
  if (h2Matches.length > 1 && images.length > 0) {
    for (let i = 1; i < h2Matches.length && insertCount < images.length; i += 2) {
      const h2Tag = h2Matches[i];
      if (!h2Tag) continue;
      
      const img = images[insertCount];
      if (!img) continue;
      
      const imageHtml = `
<figure style="margin: 2em 0;">
  <img src="${img.url}" alt="${img.alt}" style="width: 100%; height: auto; border-radius: 8px;" />
  <figcaption style="text-align: center; font-size: 0.85em; color: #666; margin-top: 0.5em;">
    Photo by <a href="${img.photographerUrl}?utm_source=blog&utm_medium=referral" target="_blank" rel="noopener">${img.photographer}</a> on <a href="https://unsplash.com?utm_source=blog&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a>
  </figcaption>
</figure>
`;
      
      result = result.replace(h2Tag, imageHtml + h2Tag);
      insertCount++;
      
      if (insertCount >= 5) break;
    }
  }

  // Paragraph fallback if not enough h2 tags
  if (insertCount < 3 && images.length > insertCount) {
    const paragraphMatches = [...result.matchAll(/<\/p>/gi)];
    let pIndex = 0;
    for (let i = insertCount; i < images.length && insertCount < 5; i++) {
      // Insert after every 3rd paragraph
      while (pIndex < paragraphMatches.length) {
        if ((pIndex + 1) % 3 === 0) {
          const match = paragraphMatches[pIndex];
          const img = images[i];
          if (match && img && typeof match.index === 'number') {
            const imgHtml = `</p>\n<figure style="margin: 2em 0;"><img src="${img.url}" alt="${img.alt}" style="width: 100%; height: auto; border-radius: 8px;" /><figcaption style="text-align: center; font-size: 0.9em; color: #666; margin-top: 0.5em;">Photo by ${img.photographer} on Unsplash</figcaption></figure>`;
            result = result.slice(0, match.index) + imgHtml + result.slice(match.index + match[0].length);
            insertCount++;
            pIndex++;
            break;
          }
        }
        pIndex++;
      }
    }
  }

  return result;
}

export async function generateImageKeywords(
  apiKey: string,
  title: string,
  content: string
): Promise<string[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const prompt = `Based on this blog post about economics/finance, suggest 3 image search keywords in English.
Return ONLY a JSON array of 3 strings, nothing else.

Title: ${title}
Content preview: ${content.substring(0, 500)}

Example response: ["stock market graph", "business meeting", "money investment"]`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 100 }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) return getDefaultKeywords();

    const data = await response.json() as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      const keywords = JSON.parse(jsonMatch[0]);
      if (Array.isArray(keywords) && keywords.length > 0) {
        return keywords.slice(0, 3);
      }
    }
  } catch (e) {
    console.error('Failed to generate image keywords:', e);
  }
  
  return getDefaultKeywords();
}

function getDefaultKeywords(): string[] {
  const defaultKeywords = [
    ['stock market', 'finance chart', 'investment'],
    ['economy', 'business growth', 'money'],
    ['trading', 'financial analysis', 'market trends'],
  ];
  return defaultKeywords[Math.floor(Math.random() * defaultKeywords.length)] || defaultKeywords[0]!;
}
