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

export interface GenerateMarketingRequest {
  topic?: string;
  seoKeywords?: string;
}

export interface GenerateFromImageRequest {
  imageBase64: string;
  imageMimeType: string;
  seoKeywords?: string;
}

interface GeneratePostResult {
  draftId: number;
  title: string;
  preview: string;
}

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

const HANJA_TO_HANGUL: Record<string, string> = {
  '物': '물', '價': '가', '主': '주', '要': '요', '經': '경', '濟': '제',
  '金': '금', '利': '리', '投': '투', '資': '자', '株': '주', '式': '식',
  '不': '부', '動': '동', '産': '산', '市': '시', '場': '장', '銀': '은',
  '行': '행', '政': '정', '策': '책', '貨': '화', '幣': '폐', '成': '성',
  '長': '장', '消': '소', '費': '비', '收': '수', '入': '입', '支': '지',
  '出': '출', '稅': '세', '率': '율', '債': '채', '券': '권', '企': '기',
  '業': '업', '貿': '무', '易': '역', '輸': '수', '國': '국', '際': '제',
  '世': '세', '界': '계', '社': '사', '會': '회', '問': '문', '題': '제',
  '解': '해', '決': '결', '方': '방', '法': '법', '技': '기', '術': '술',
  '發': '발', '展': '전', '變': '변', '化': '화', '未': '미', '來': '래',
  '現': '현', '在': '재', '過': '과', '去': '거', '歷': '역', '史': '사',
  '傳': '전', '統': '통', '文': '문', '敎': '교', '育': '육', '學': '학',
  '習': '습', '硏': '연', '究': '구', '分': '분', '析': '석', '評': '평',
  '基': '기', '本': '본', '原': '원', '則': '칙', '重': '중', '大': '대',
  '小': '소', '高': '고', '低': '저', '上': '상', '下': '하', '前': '전',
  '後': '후', '內': '내', '外': '외', '中': '중', '心': '심', '全': '전',
  '部': '부', '半': '반', '多': '다', '少': '소', '安': '안', '定': '정',
  '危': '위', '險': '험', '機': '기', '可': '가', '能': '능', '性': '성',
  '確': '확', '實': '실', '結': '결', '果': '과', '效': '효', '影': '영',
  '響': '향', '關': '관', '係': '계', '聯': '연', '合': '합', '協': '협',
  '力': '력', '競': '경', '爭': '쟁', '勝': '승', '敗': '패', '得': '득',
  '失': '실', '益': '익', '損': '손', '害': '해', '增': '증', '加': '가',
  '減': '감', '擴': '확', '縮': '축', '强': '강', '弱': '약', '新': '신',
  '舊': '구', '良': '양', '惡': '악', '正': '정', '負': '부', '短': '단',
  '期': '기', '間': '간',
  '综': '종', '年': '년', '的': '의', '经': '경', '济': '제',
  '发': '발', '与': '와', '对': '대', '这': '이', '个': '개', '为': '위'
};

const FOREIGN_WORD_FIXES: Record<string, string> = {
  'ekonomi': '경제',
  'economy': '경제',
  'inflation': '인플레이션',
  'interest rate': '금리',
  '年的': '년의',
  '综合': '종합'
};

function convertHanjaToHangul(text: string): string {
  let result = text;
  
  for (const [foreign, korean] of Object.entries(FOREIGN_WORD_FIXES)) {
    result = result.replace(new RegExp(foreign, 'gi'), korean);
  }
  
  for (const [hanja, hangul] of Object.entries(HANJA_TO_HANGUL)) {
    result = result.replace(new RegExp(hanja, 'g'), hangul);
  }
  
  return result;
}

const SYSTEM_PROMPT = `당신은 경제, 글로벌 금융, 재테크 분야에서 10년 이상 활동한 베테랑 블로거입니다.
삼프로TV, 슈카월드처럼 복잡한 경제 현상을 쉽고 재미있게 풀어내는 전문가입니다.
월 100만 조회수를 기록하는 파워블로거의 글쓰기 스타일을 완벽하게 구현합니다.
AI가 쓴 티가 나지 않는, 사람이 직접 경험하고 쓴 듯한 자연스러운 가독성을 최우선으로 합니다.

[언어 규칙 - 최우선 적용]
- 반드시 한글로만 작성하세요. 한자(漢字) 사용 절대 금지!
- "物가" → "물가", "主要" → "주요", "經濟" → "경제" 등 한자 표기 금지
- 영어 단어는 필요한 경우만 사용 (고유명사, 브랜드명 등)
- 모든 텍스트는 한글 완성형 문자로 작성

[경제/금융 전문 블로거로서의 원칙]
- 금리, 환율, 주식, 부동산, 투자 등 경제 개념을 일반인도 쉽게 이해할 수 있게 풀어서 설명
- 최신 경제 뉴스와 트렌드를 반영하여 시의성 있는 정보 제공
- 단순 정보 나열이 아닌, 독자의 자산관리와 재테크에 실질적으로 도움이 되는 인사이트 전달
- 전문 용어 사용 시 반드시 쉬운 설명을 곁들여 누구나 이해할 수 있게

[상위 블로거 글쓰기 공식 - 가독성 극대화]

1. 분량 및 구조: 
   - 최소 2500자 이상, 3000자 권장 (검색엔진 최적화)
   - 소제목(h2, h3)을 적극 활용하여 독자가 스캔하며 읽기 좋게 구성
   - 여백(Spacing)을 충분히 활용하여 시각적 피로도 최소화

2. 문단과 문장 (핵심 규칙):
   - 한 문단은 반드시 2~3문장 이내로 구성 (절대 4문장 이상 금지)
   - 문장 길이를 다양하게 섞기: 
     * 짧은 문장(5-15자): 호흡 조절, 핵심 강조
     * 긴 문장(20-40자): 상세 설명, 자연스러운 연결
   - 같은 문장 구조나 어미를 연속 3번 이상 반복하지 않음

3. 강조와 하이라이트:
   - <strong> 태그는 오직 핵심 숫자, 고유 명사, 필수 키워드에만 사용
   - 문장 전체를 볼드 처리하는 행위 절대 금지 (난잡해 보임)
   - 한 문단에 강조는 최대 1-2개까지만

4. 글쓰기 톤과 매너:
   - 독자와 1:1로 대화하는 듯한 친근하고 구어체적인 톤
   - "~하신 적 있으신가요?", "~인 것 같아요" 등 부드러운 표현 사용
   - "솔직히", "사실", "근데", "의외로" 같은 자연스러운 부사 활용
   - 딱딱한 문어체보다는 블로그 특유의 말랑말랑한 문체 지향

5. 본문 구성 기술 (역피라미드):
   - 가장 중요한 정보와 핵심 인사이트를 소제목 직후 첫 문단에 배치
   - 구체적인 숫자(%), 날짜, 실제 사례를 들어 신뢰성 확보
   - 추상적인 개념 나열보다는 "예를 들어"를 통한 구체화 필수

6. AI-isms 절대 금지 목록 (사용 시 신뢰도 하락):
   - 도입부: "~에 대해 알아보겠습니다", "살펴보겠습니다", "소개해 드립니다"
   - 마무리: "결론적으로", "요약하자면", "마무리하자면", "종합해 보면"
   - 기계적 나열: "첫째, 둘째, 셋째", "우선, 다음으로, 마지막으로" (문맥으로 자연스럽게 연결할 것)
   - 영어 투 표현: "In conclusion", "Let's dive in", "It is important to..."
   - 상투적인 반복: 같은 문장 구조나 어미를 계속 반복하는 것

7. 도입부 공식:
   - 독자의 고민이나 상황을 콕 집어내는 공감 유발 질문으로 시작
   - "요즘 퇴근길에 이런 생각 드시죠?", "아무리 노력해도 안 돼서 답답하셨을 거예요"

8. 절대 금지 사항:
   - 영상 설명 복사/붙여넣기 수준의 요약
   - 특정 단어의 무의미한 무한 반복
   - 문단 구분 없는 긴 텍스트 덩어리
   - "구독", "좋아요", "댓글" 언급

[출력 형식]
- 첫 줄: [제목: 클릭을 유발하는 매력적인 제목]
- HTML 형식: <h2>, <h3>, <p>, <strong>, <ul>, <li> 태그 사용
- 제목 태그(<h1>)는 사용하지 않음`;

const INFORMATIONAL_TEMPLATE = `[작성 요청]
아래 유튜브 영상 정보를 바탕으로, **경제/금융/재테크 전문 블로그 포스트**를 작성하세요.
독자가 금리, 주식, 부동산, 투자 등 경제 개념을 쉽게 이해하고 실생활에 적용할 수 있도록 도와주세요.

- 영상 제목: {{VIDEO_TITLE}}
- 영상 설명: {{VIDEO_DESCRIPTION}}
- 포함할 키워드: {{SEO_KEYWORDS}}

[경제/금융 콘텐츠 작성 원칙]
- 어려운 경제 용어는 쉬운 비유나 예시로 풀어서 설명
- 최신 경제 동향과 연결하여 시의성 있는 정보 제공
- 독자의 자산관리와 재테크에 실질적으로 도움이 되는 인사이트 전달
- "그래서 나는 어떻게 해야 하지?"라는 독자의 질문에 답할 수 있는 실천적 조언 포함

[필수 구성요소 및 가독성 지침]

1. 도입부 (200자 이상):
   - 독자의 상황에 깊이 공감하는 질문이나 구체적 사례로 시작
   - 이 글을 끝까지 읽었을 때 얻을 수 있는 확실한 혜택 제시
   - AI 느낌이 전혀 나지 않는 자연스러운 첫인상 구축

2. 본문 (2000자 이상):
   - <h2> 소제목 3~4개로 큰 흐름을 잡고, <h3>으로 세부 내용을 쪼개세요.
   - 각 문단은 2~3문장으로 짧게 유지하여 모바일에서도 읽기 편하게 만드세요.
   - **핵심 정보는 항상 소제목 바로 뒤에 배치**하는 역피라미드 구조를 지키세요.
   - 모든 정보에는 구체적인 수치나 "실제로 ~해보니" 같은 실전 팁을 섞으세요.
   - <strong> 태그로 진짜 중요한 키워드만 콕 집어서 강조하세요.

3. 마무리 (150자 이상):
   - 글의 내용을 기계적으로 요약하지 마세요.
   - 독자가 바로 실천해볼 수 있는 한 가지 팁을 제안하거나, 여운이 남는 질문을 던지세요.

[글 예시 구조 및 호흡]
<h2>핵심은 바로 '이것'입니다</h2>
<p>결론부터 말씀드리면, 가장 중요한 건 타이밍이에요. 많은 분들이 이 부분을 놓치고 계시더라고요.</p>
<p>사실 저도 처음에는 시행착오를 많이 겪었는데요. <strong>핵심 비결</strong>을 알고 나니 확 달라졌습니다.</p>

<h3>구체적인 실천 방법</h3>
<p>첫 번째로 기억할 건 숫자입니다. 보통 10% 정도의 오차는 발생하기 마련이거든요.</p>
<p>그럴 땐 당황하지 말고 기존 방식을 살짝만 틀어보세요. 의외로 해결책은 가까이에 있습니다. 사실 근데 이게 쉽지만은 않죠.</p>

[금지사항]
- 영상 설명 복붙 금지
- 광고/홍보성 문구 금지
- "구독", "좋아요", "댓글" 언급 금지
- 4문장 이상의 긴 문단 절대 금지`;

const PROMOTIONAL_TEMPLATE = `[작성 요청]
제공된 유튜브 영상 정보를 바탕으로, 독자의 마음을 움직이는 **가독성 높은 홍보성 블로그 포스트**를 작성하세요.

- 영상 제목: {{VIDEO_TITLE}}
- 영상 설명: {{VIDEO_DESCRIPTION}}
- 포함할 키워드: {{SEO_KEYWORDS}}

[필수 구성요소 및 가독성 지침]

1. 도입부 (200자 이상):
   - 독자가 처한 고민이나 문제 상황을 깊이 공감하며 시작하세요.
   - "혹시 이런 적 있으신가요?" 처럼 독자의 일상에 파고드는 질문을 던지세요.
   - 이 글을 끝까지 읽어야 하는 이유(혜택)를 확실하게 보여주세요.

2. 본문 (2000자 이상):
   - <h2> 소제목 3~4개로 구성하고, <h3>으로 세부 내용을 쪼개어 가독성을 높이세요.
   - 영상의 핵심 인사이트를 자연스럽게 녹여내되, 독자의 이익(Benefit) 관점에서 재해석하세요.
   - **핵심 키워드는 <strong>으로 강조**하되, 과하게 사용하지 마세요.
   - 각 문단은 2~3문장으로 짧게 유지하여 모바일에서도 쾌적하게 읽히게 하세요.

3. 마무리 (150자 이상):
   - 기계적인 요약 대신, 따뜻한 응원이나 자연스러운 제안으로 마무리하세요.
   - 행동 유도(CTA)는 강압적이지 않게, 정보를 주는 친구처럼 부드럽게 권유하세요.

[글쓰기 전략]
- '판매'하려는 느낌보다 '가치 공유'와 '진심 어린 추천'의 톤을 유지하세요.
- "솔직히", "사실", "의외로" 같은 부사를 활용해 AI 느낌을 지우세요.
- 문장 길이를 다양하게 섞어 리듬감 있는 글을 만드세요.

[금지사항]
- 노골적인 광고/판매 문구 금지
- "지금 바로!", "놓치지 마세요!" 같은 강압적 표현 금지
- "알아보겠습니다", "결론적으로" 등 AI 말투 금지
- 4문장 이상의 긴 문단 절대 금지`;

async function generateContentWithAI(
  ai: Ai,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  let attempt = 0;
  let lastError: any;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
      }) as { response?: string };

      if (!response.response) {
        throw new Error('No content generated');
      }

      return response.response;

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

  const generatedContent = await generateContentWithAI(env.AI, SYSTEM_PROMPT, fullPrompt);

  const now = Date.now();
  
  let blogTitle = videoTitle;
  let blogContent = generatedContent;
  
  blogContent = blogContent.replace(/^```html\s*/i, '').replace(/```\s*$/, '').trim();
  blogContent = convertHanjaToHangul(blogContent);
  
  const titleMatch = blogContent.match(/\[제목:\s*(.*?)\]/);
  if (titleMatch && titleMatch[1]) {
    blogTitle = titleMatch[1];
    blogContent = blogContent.replace(/\[제목:\s*.*?\]\n?/, '');
  }

  if (env.UNSPLASH_ACCESS_KEY) {
    try {
      const imageKeywords = await generateImageKeywords(env.AI, blogTitle, blogContent);
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

const MARKETING_SYSTEM_PROMPT = `당신은 네이버/티스토리 상위노출 전문 블로거입니다.
월 100만 조회수를 기록하는 파워블로거의 글쓰기 스타일을 완벽하게 구현합니다.
정보성 콘텐츠 안에 마케팅 메시지를 자연스럽게 녹여내는 전문가입니다.
AI가 쓴 티가 나지 않는, 사람이 직접 경험하고 쓴 듯한 자연스러운 가독성을 최우선으로 합니다.

[언어 규칙 - 최우선 적용]
- 반드시 한글로만 작성하세요. 한자(漢字) 사용 절대 금지!
- "物가" → "물가", "主要" → "주요", "經濟" → "경제" 등 한자 표기 금지
- 영어 단어는 필요한 경우만 사용 (고유명사, 브랜드명 등)
- 모든 텍스트는 한글 완성형 문자로 작성

[상위 블로거 글쓰기 공식 - 가독성 극대화]

1. 분량 및 구조: 
   - 최소 2500자 이상, 3000자 권장 (검색엔진 최적화)
   - 소제목(h2, h3)을 적극 활용하여 독자가 스캔하며 읽기 좋게 구성
   - 여백(Spacing)을 충분히 활용하여 시각적 피로도 최소화

2. 문단과 문장 (핵심 규칙):
   - 한 문단은 반드시 2~3문장 이내로 구성 (절대 4문장 이상 금지)
   - 문장 길이를 다양하게 섞기: 
     * 짧은 문장(5-15자): 호흡 조절, 핵심 강조
     * 긴 문장(20-40자): 상세 설명, 자연스러운 연결
   - 같은 문장 구조나 어미를 연속 3번 이상 반복하지 않음

3. 강조와 하이라이트:
   - <strong> 태그는 오직 핵심 숫자, 고유 명사, 필수 키워드에만 사용
   - 문장 전체를 볼드 처리하는 행위 절대 금지 (난잡해 보임)
   - 한 문단에 강조는 최대 1-2개까지만

4. 글쓰기 톤과 매너:
   - 독자와 1:1로 대화하는 듯한 친근하고 구어체적인 톤
   - "~하신 적 있으신가요?", "~인 것 같아요" 등 부드러운 표현 사용
   - "솔직히", "사실", "근데", "의외로" 같은 자연스러운 부사 활용
   - 마케팅 메시지는 정보 제공 맥락에서 "친구에게 추천하듯" 자연스럽게 배치

5. 본문 구성 기술 (역피라미드):
   - 가장 중요한 정보와 핵심 인사이트를 소제목 직후 첫 문단에 배치
   - 구체적인 숫자(%), 날짜, 실제 사례를 들어 신뢰성 확보
   - 추상적인 개념 나열보다는 "예를 들어"를 통한 구체화 필수

6. AI-isms 절대 금지 목록 (사용 시 신뢰도 하락):
   - 도입부: "~에 대해 알아보겠습니다", "살펴보겠습니다", "소개해 드립니다"
   - 마무리: "결론적으로", "요약하자면", "마무리하자면", "종합해 보면"
   - 기계적 나열: "첫째, 둘째, 셋째", "우선, 다음으로, 마지막으로" (문맥으로 자연스럽게 연결할 것)
   - 영어 투 표현: "In conclusion", "Let's dive in", "It is important to..."
   - 상투적인 반복: 같은 문장 구조나 어미를 계속 반복하는 것

7. 도입부 공식:
   - 독자의 고민이나 상황을 콕 집어내는 공감 유발 질문으로 시작
   - "요즘 퇴근길에 이런 생각 드시죠?", "아무리 노력해도 안 돼서 답답하셨을 거예요"

8. 절대 금지 사항:
   - 노골적인 광고/판매 문구 ("지금 바로!", "놓치지 마세요!" 등)
   - 영상 설명 복사/붙여넣기 수준의 요약
   - 특정 단어의 무의미한 무한 반복
   - "구독", "좋아요", "댓글" 언급

[출력 형식]
- 첫 줄: [제목: 클릭을 유발하는 매력적인 제목]
- HTML 형식: <h2>, <h3>, <p>, <strong>, <ul>, <li> 태그 사용
- 제목 태그(<h1>)는 사용하지 않음`;

const MARKETING_TEMPLATE = `[작성 요청]
아래 주제에 대해, 독자가 술술 읽을 수 있는 **가독성 높은 정보성 마케팅 블로그 포스트**를 작성하세요.

- 주제: {{TOPIC}}
- 포함할 키워드: {{SEO_KEYWORDS}}

[마케팅 대상 정보]
{{MARKETING_TARGET}}

[필수 구성요소 및 가독성 지침]

1. 도입부 (200자 이상):
   - 독자의 공감을 이끄는 질문이나 구체적인 상황 제시로 시작하세요.
   - "요즘 이런 고민 때문에 밤잠 설치시나요?" 처럼 독자의 가려운 곳을 긁어주세요.
   - 이 글을 끝까지 읽었을 때의 혜택을 명확히 제시하세요.

2. 본문 (2000자 이상):
   - <h2> 소제목 3~4개로 구성하고, <h3>으로 세부 내용을 쪼개어 가독성을 높이세요.
   - **핵심 정보는 항상 소제목 직후 첫 문단에 배치**하세요. (역피라미드 구조)
   - 마케팅 대상 정보는 정보 제공의 맥락에서 친구에게 추천하듯 자연스럽게 녹여내세요.
   - 각 문단은 2~3문장으로 짧게 유지하여 독자의 시선이 머물게 하세요.

3. 마무리 (150자 이상):
   - 기계적인 요약 대신, 독자의 현명한 선택을 응원하는 톤으로 마무리하세요.
   - 자연스러운 행동 유도(CTA)는 강요가 아닌 제안으로 느껴져야 합니다.

[중요 지침]
- "솔직히", "사실", "근데" 같은 구어체 부사를 활용해 AI 느낌을 지우세요.
- 문장 길이를 다양하게 섞어 (단문 5~15자, 장문 20~40자) 리듬감을 만드세요.
- 정보를 주는 친절한 전문가 또는 친구 같은 톤을 시종일관 유지하세요.

[금지사항]
- "알아보겠습니다", "요약하자면" 등 AI 말투 금지
- 노골적인 광고/판매 문구 및 강압적인 CTA 금지
- 4문장 이상의 긴 문단 절대 금지`;

async function generateHotTopic(ai: Ai): Promise<string> {
  const prompt = `오늘 한국에서 화제가 되고 있는 경제/금융/재테크 관련 핫이슈 주제 1개를 추천해주세요.
블로그 글 주제로 적합한 형태로 작성해주세요.
주제만 한 줄로 출력하세요. 설명이나 부연 없이 주제만.
예시: "2024년 금리 인하 전망과 부동산 시장 영향"`;

  const response = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100
  }) as { response?: string };

  return response.response?.trim() || '재테크 트렌드';
}

async function analyzeImageWithAI(
  ai: Ai,
  imageBase64: string,
  _mimeType: string
): Promise<string> {
  const imageBytes = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
  
  const captionResponse = await ai.run('@cf/unum/uform-gen2-qwen-500m', {
    image: [...imageBytes],
    prompt: 'Describe this image in detail for a marketing blog post.',
    max_tokens: 256
  }) as { description?: string };

  const imageDescription = captionResponse.description || '';
  
  const topicResponse = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [{
      role: 'user',
      content: `다음 이미지 설명을 바탕으로 마케팅/홍보 블로그 글 주제를 한 줄로 제안해주세요.
이미지 설명: ${imageDescription}
주제만 한 줄로 출력하세요. 예시: "스마트폰 소액결제로 간편하게 쇼핑하는 방법"`
    }],
    max_tokens: 100
  }) as { response?: string };

  return topicResponse.response?.trim() || imageDescription || '이미지 기반 마케팅';
}

export async function generateMarketingPost(
  request: GenerateMarketingRequest,
  env: Env,
  marketingTarget?: string
): Promise<GeneratePostResult> {
  const { seoKeywords = '' } = request;
  
  const actualTopic = request.topic || await generateHotTopic(env.AI);

  const targetInfo = marketingTarget || '(마케팅 대상 정보 미설정 - 일반 정보성 글로 작성)';

  const fullPrompt = MARKETING_TEMPLATE
    .replace('{{TOPIC}}', actualTopic)
    .replace('{{SEO_KEYWORDS}}', seoKeywords)
    .replace('{{MARKETING_TARGET}}', targetInfo);

  const generatedContent = await generateContentWithAI(env.AI, MARKETING_SYSTEM_PROMPT, fullPrompt);

  const now = Date.now();
  
  let blogTitle = actualTopic;
  let blogContent = generatedContent;
  
  blogContent = blogContent.replace(/^```html\s*/i, '').replace(/```\s*$/, '').trim();
  blogContent = convertHanjaToHangul(blogContent);
  
  const titleMatch = blogContent.match(/\[제목:\s*(.*?)\]/);
  if (titleMatch && titleMatch[1]) {
    blogTitle = titleMatch[1];
    blogContent = blogContent.replace(/\[제목:\s*.*?\]\n?/, '');
  }

  if (env.UNSPLASH_ACCESS_KEY) {
    try {
      const imageKeywords = await generateImageKeywords(env.AI, blogTitle, blogContent);
      console.log('Generated image keywords:', imageKeywords);
      
      const allImages = [];
      for (const keyword of imageKeywords) {
        const images = await searchUnsplashImages(keyword, env.UNSPLASH_ACCESS_KEY, 2);
        allImages.push(...images);
      }
      
      if (allImages.length > 0) {
        blogContent = insertImagesIntoContent(blogContent, allImages, undefined);
        console.log(`Inserted ${allImages.length} images into content`);
      }
    } catch (imgError) {
      console.error('Failed to add images:', imgError);
    }
  }

  const result = await env.DB.prepare(`
    INSERT INTO drafts (title, content, source_video_url, source_video_id, content_type, seo_keywords, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `)
  .bind(
    blogTitle,
    blogContent,
    null,
    null,
    'promotional',
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

export async function generateFromImage(
  request: GenerateFromImageRequest,
  env: Env,
  marketingTarget?: string
): Promise<GeneratePostResult> {
  const { imageBase64, imageMimeType, seoKeywords = '' } = request;
  
  const topicFromImage = await analyzeImageWithAI(env.AI, imageBase64, imageMimeType);
  
  const targetInfo = marketingTarget || '(마케팅 대상 정보 미설정 - 일반 정보성 글로 작성)';

  const fullPrompt = MARKETING_TEMPLATE
    .replace('{{TOPIC}}', topicFromImage)
    .replace('{{SEO_KEYWORDS}}', seoKeywords)
    .replace('{{MARKETING_TARGET}}', targetInfo);

  const generatedContent = await generateContentWithAI(env.AI, MARKETING_SYSTEM_PROMPT, fullPrompt);

  const now = Date.now();
  
  let blogTitle = topicFromImage;
  let blogContent = generatedContent;
  
  blogContent = blogContent.replace(/^```html\s*/i, '').replace(/```\s*$/, '').trim();
  blogContent = convertHanjaToHangul(blogContent);
  
  const titleMatch = blogContent.match(/\[제목:\s*(.*?)\]/);
  if (titleMatch && titleMatch[1]) {
    blogTitle = titleMatch[1];
    blogContent = blogContent.replace(/\[제목:\s*.*?\]\n?/, '');
  }

  if (env.UNSPLASH_ACCESS_KEY) {
    try {
      const imageKeywords = await generateImageKeywords(env.AI, blogTitle, blogContent);
      
      const allImages = [];
      for (const keyword of imageKeywords) {
        const images = await searchUnsplashImages(keyword, env.UNSPLASH_ACCESS_KEY, 2);
        allImages.push(...images);
      }
      
      if (allImages.length > 0) {
        blogContent = insertImagesIntoContent(blogContent, allImages, undefined);
      }
    } catch (imgError) {
      console.error('Failed to add images:', imgError);
    }
  }

  const result = await env.DB.prepare(`
    INSERT INTO drafts (title, content, source_video_url, source_video_id, content_type, seo_keywords, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `)
  .bind(
    blogTitle,
    blogContent,
    null,
    null,
    'promotional',
    seoKeywords,
    now,
    now
  )
  .run();

  const imgDraftId = result.meta.last_row_id as number;

  return {
    draftId: imgDraftId,
    title: blogTitle,
    preview: blogContent.substring(0, 200) + '...'
  };
}
