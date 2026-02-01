import type { Env } from '../types';
import { 
  searchUnsplashImages, 
  insertImagesIntoContent, 
  generateImageKeywords 
} from '../utils/images';

export interface GeneratePostRequest {
  videoId: string;
  videoTitle: string;
  videoDescription: string;
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

const SYSTEM_PROMPT = `당신은 경제, 글로벌 금융 분야에서 전문성을 가진 베테랑 블로거이자 스토리텔러입니다.
단순히 정보를 나열하는 것이 아니라, 독자가 흥미를 느끼고 끝까지 읽게 만드는 흡입력 있는 글을 씁니다.

[핵심 글쓰기 지침]
1. AI 특유의 톤앤매너 제거:
   - "이 글에서는 ~에 대해 알아보겠습니다", "첫째, 둘째, 셋째...", "결론적으로" 같은 기계적인 표현을 절대 사용하지 마세요.
   - 문장의 길이를 다양하게 조절하세요 (10자 내외의 단문과 50자 이상의 복문을 적절히 섞기).

2. 자연스러운 흐름과 연결:
   - 소제목은 내용의 핵심을 관통하는 임팩트 있는 문구로 작성하되, 번호를 매기지 마세요.
   - 문단 사이의 연결이 매끄러워야 하며, 앞 문단의 끝과 다음 문단의 시작이 논리적 혹은 감성적으로 이어지게 하세요.

3. 개인적 관점과 구어체 삽입:
   - "솔직히 말씀드리면", "사실 저도 이 부분은 의외였는데요", "근데 여기서 중요한 건" 같은 구어체 표현을 문맥에 맞게 섞어 인간적인 느낌을 줍니다.
   - 글의 중간중간에 현재 상황에 대한 냉철한 분석이나 주관적인 의견을 1-2개 정도 자연스럽게 포함하세요.

4. 서술 방식:
   - 정보를 단순히 요약하는 수준을 넘어, 왜 이 정보가 지금 우리에게 중요한지 '맥락'을 짚어주세요.
   - 삼프로TV나 슈카월드처럼 복잡한 경제 현상을 쉽고 재미있게 풀어내는 스타일을 유지하세요.

5. 마무리:
   - "도움이 되셨길 바랍니다" 같은 뻔한 마무리 대신, 독자가 생각해볼 만한 질문을 던지거나 여운을 남기는 한 마디로 끝내세요.
   - **절대 금지**: "구독", "좋아요", "알림 설정", "공유", "댓글", "더 알아보기", "클릭", "확인해보세요" 등의 행동 유도 문구

6. SEO 최적화:
   - 제공된 SEO 키워드를 문맥에 어긋나지 않게 자연스럽게 녹여내세요. (키워드 억지로 끼워넣기 금지)

7. 출력 형식:
    - 반드시 HTML 형식으로 출력하세요. <h2>, <h3>, <p> 태그를 사용하세요.
    - 글 제목은 첫 줄에 [제목: 실제제목] 형식으로 작성하세요.

8. 자연스러운 문장 리듬:
   - 문장 길이를 5단어부터 25단어까지 다양하게 섞으세요.
   - 짧은 문장으로 임팩트를 주고, 긴 문장으로 설명을 풀어가세요.
   - 같은 문장 구조를 연속으로 3번 이상 사용하지 마세요.

9. AI 특유 표현 절대 금지 (사용하면 실격):
   - "In conclusion", "결론적으로", "요약하자면"
   - "Let's dive in", "자세히 알아보겠습니다", "살펴보도록 하겠습니다"
   - "It's important to note that", "중요한 점은"
   - "First and foremost", "먼저"로 모든 문단 시작
   - "Without further ado"
   - "At the end of the day", "결국에는"
   - 모든 섹션을 "그럼", "자", "이제"로 시작하기

10. 인간적인 글쓰기 기법:
    - 축약형 자연스럽게 사용 (것은 → 건, 하는 것이 → 하는 게)
    - 가끔 수사적 질문 던지기
    - 구체적인 숫자와 예시 사용 (일반화 피하기)
    - 개인적인 관찰이나 의견 1-2개 포함
    - 완벽한 문법보다 자연스러운 흐름 우선`;

const INFORMATIONAL_TEMPLATE = `[지시사항]
아래 제공되는 유튜브 영상 정보를 바탕으로 깊이 있는 순수 정보성 블로그 포스트를 작성해 주세요.
영상의 설명을 참고하여 주제와 핵심 내용을 파악한 뒤, 그에 맞는 블로그 글을 작성하세요.

- 영상 제목: {{VIDEO_TITLE}}
- 영상 설명: {{VIDEO_DESCRIPTION}}
- 포함할 핵심 키워드: {{SEO_KEYWORDS}}

[포스트 구조 및 요구사항]
1. 인트로: 현재 경제 상황이나 대중의 관심사를 끌어들여 왜 이 주제가 중요한지 화두를 던지며 시작하세요.
2. 본문 1-3: 영상 설명에서 파악한 핵심 주제를 2~3개의 큰 덩어리로 구성하세요. 각 덩어리는 독립적인 주제를 갖되 자연스럽게 연결되어야 합니다.
3. 통찰(Insight): 정보 전달에만 그치지 말고, 이 내용이 앞으로의 시장이나 개인의 자산 관리에 어떤 영향을 미칠지 통찰력을 덧붙여 주세요.
4. 아웃트로: 핵심 메시지를 한 문장으로 정리하거나, 독자가 생각해볼 만한 열린 질문을 던지며 여운을 남기세요.

[금기 사항 - 반드시 준수]
- 영상 설명을 그대로 복사-붙여넣기 하지 마세요. 완전히 당신의 언어로 재해석해야 합니다.
- 지나치게 딱딱한 논문 스타일이나 불필요한 전문 용어 남발을 피하세요.
- 정보가 부족하면 해당 주제에 대한 일반적인 지식을 활용해 풍부하게 작성하세요.
- **AI 특유 표현 금지 목록** (이 표현들을 사용하면 AI가 쓴 티가 남):
  - "~에 대해 알아보겠습니다", "~를 살펴보겠습니다"
  - "여러분", "독자 여러분" (격식체로 거리감 생김)
  - "~하는 것이 중요합니다", "~해야 합니다" 남발
  - 매 문단 끝을 "~니다", "~습니다"로 통일
  - 글머리 기호/번호 과다 사용
  
- **대신 이렇게 쓰세요**:
  - 일상 대화체 섞기: "솔직히", "사실", "근데"
  - 생각의 흐름 보여주기: "처음엔 저도 의아했는데", "곰곰이 생각해보면"
  - 구체적 경험 언급: "최근 기사에서 봤는데", "주변에서 이런 얘기를 들었는데"

- **광고성/홍보성 요소 절대 금지**: 어떤 행동을 유도하는 CTA(Call-to-Action), 제품/서비스 추천, 구독/좋아요 요청, 링크 클릭 유도 등 일체의 홍보성 문구를 포함하지 마세요.
- **순수 정보 제공**: 이 글의 목적은 오직 독자에게 유익한 정보와 통찰을 전달하는 것입니다. 무언가를 팔거나 권유하는 느낌이 조금이라도 나면 안 됩니다.
- **마무리 금지 문구**: 다음 문구들은 절대 사용하지 마세요:
  - "구독", "좋아요", "알림 설정", "공유해 주세요"
  - "댓글로 의견을 남겨주세요", "댓글로 알려주세요"
  - "더 알아보기", "자세히 보기", "클릭", "확인해 보세요"
  - "다음 글에서 만나요", "다음 포스팅을 기대해 주세요"
  - "도움이 되셨다면", "유익하셨다면"
- **글의 마무리**: 핵심 메시지 요약이나 독자가 생각해볼 질문으로만 끝내세요. 어떤 행동 요청도 하지 마세요.`;

const PROMOTIONAL_TEMPLATE = `[지시사항]
제공된 유튜브 영상 정보를 바탕으로, 독자의 흥미를 유발하고 특정 행동(CTA)을 유도하는 홍보성 블로그 포스트를 작성해 주세요.

- 영상 제목: {{VIDEO_TITLE}}
- 영상 설명: {{VIDEO_DESCRIPTION}}
- 포함할 핵심 키워드: {{SEO_KEYWORDS}}

[포스트 구조 및 요구사항]
1. 후킹(Hook): 독자가 처한 고민이나 문제 상황을 콕 집어내며 시작하세요.
2. 해결책 제시: 영상에서 다루는 내용이 왜 독자의 고민에 대한 해답이 될 수 있는지 설득력 있게 설명하세요.
3. 신뢰 부여: 영상의 핵심 인사이트를 요약하여 제시함으로써 이 정보가 가치 있음을 증명하세요.
4. 강력한 CTA: 글의 마지막에 독자가 지금 바로 해야 할 행동을 자연스럽게 유도하세요.

[글쓰기 전략]
- '판매'하려는 느낌보다는 '공유'하고 '추천'한다는 진정성 있는 톤을 유지하세요.
- 독자의 이익(Benefit)을 중심으로 서술하세요.
- 가독성을 위해 문단을 짧게 끊어 치고, 핵심 문구는 강조해 주세요.`;

async function generateContentWithGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
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
  const { videoId, videoTitle, videoDescription, contentType, seoKeywords = '' } = request;

  const templatePrompt = contentType === 'informational' ? INFORMATIONAL_TEMPLATE : PROMOTIONAL_TEMPLATE;

  const fullPrompt = templatePrompt
    .replace('{{VIDEO_TITLE}}', videoTitle)
    .replace('{{VIDEO_DESCRIPTION}}', videoDescription.substring(0, 5000))
    .replace('{{SEO_KEYWORDS}}', seoKeywords);

  const generatedContent = await generateContentWithGemini(env.GEMINI_API_KEY, SYSTEM_PROMPT, fullPrompt);

  const now = Date.now();
  
  let blogTitle = videoTitle;
  let blogContent = generatedContent;
  
  blogContent = blogContent.replace(/^```html\s*/i, '').replace(/```\s*$/, '').trim();
  
  const titleMatch = blogContent.match(/\[제목:\s*(.*?)\]/);
  if (titleMatch && titleMatch[1]) {
    blogTitle = titleMatch[1];
    blogContent = blogContent.replace(/\[제목:\s*.*?\]\n?/, '');
  }

  if (env.UNSPLASH_ACCESS_KEY) {
    try {
      const imageKeywords = await generateImageKeywords(env.GEMINI_API_KEY, blogTitle, blogContent);
      console.log('Generated image keywords:', imageKeywords);
      
      const allImages = [];
      for (const keyword of imageKeywords) {
        const images = await searchUnsplashImages(keyword, env.UNSPLASH_ACCESS_KEY, 2);
        allImages.push(...images);
      }
      
      if (allImages.length > 0) {
        blogContent = insertImagesIntoContent(blogContent, allImages, videoId);
        console.log(`Inserted ${allImages.length} images into content`);
      }
    } catch (imgError) {
      console.error('Failed to add images:', imgError);
    }
  } else {
    const { insertImagesIntoContent: insertWithThumbnail } = await import('../utils/images');
    blogContent = insertWithThumbnail(blogContent, [], videoId);
  }

  const result = await env.DB.prepare(`
    INSERT INTO drafts (title, content, source_video_url, source_video_id, content_type, seo_keywords, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
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

  const draftId = result.meta.last_row_id as number;

  return {
    draftId,
    title: blogTitle,
    preview: blogContent.substring(0, 200) + '...'
  };
}
