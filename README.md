# YouTube → Blogger 자동 포스팅 시스템

글로벌 경제/금융/재테크 유튜브 영상을 참고해 AI가 자연스러운 블로그 글을 자동 생성하고, 팀원이 검토 후 Google Blogger에 발행하는 시스템입니다.

## 기능

- **YouTube 영상 자동 수집**: 경제/금융 관련 인기 영상 자동 탐색
- **AI 글 생성**: Gemini API로 자연스러운 블로그 글 작성 (AI 티 안 나게)
- **대시보드**: 비개발자도 사용 가능한 웹 UI
- **자동 발행**: 승인된 글을 Google Blogger에 자동 게시
- **스케줄링**: 매일 2회 자동 실행 (9시, 15시 KST)

## 기술 스택

- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: React + Tailwind CSS (Cloudflare Pages)
- **APIs**: YouTube Data API, Gemini API, Blogger API

## 설치 및 설정

### 1. 의존성 설치

```bash
bun install
cd dashboard && bun install && cd ..
```

### 2. Cloudflare 인증

```bash
npx wrangler login
```

### 3. D1 데이터베이스 생성

```bash
npx wrangler d1 create youtube-blogger-db
```

출력된 `database_id`를 `wrangler.toml`에 업데이트하세요.

### 4. 스키마 적용

```bash
npx wrangler d1 execute youtube-blogger-db --file migrations/0001_initial_schema.sql
```

### 5. 환경변수 설정

`.dev.vars` 파일을 생성하고 아래 값들을 입력하세요:

```
YOUTUBE_API_KEY=your_youtube_api_key
GEMINI_API_KEY=your_gemini_api_key
BLOGGER_CLIENT_ID=your_blogger_client_id
BLOGGER_CLIENT_SECRET=your_blogger_client_secret
BLOGGER_REFRESH_TOKEN=your_blogger_refresh_token
BLOGGER_BLOG_ID=your_blog_id
DASHBOARD_PASSWORD=your_dashboard_password
```

#### API 키 발급 방법

- **YouTube API**: [Google Cloud Console](https://console.cloud.google.com/) → YouTube Data API v3
- **Gemini API**: [Google AI Studio](https://aistudio.google.com/)
- **Blogger API**: Google Cloud Console → OAuth 2.0 Client ID 생성

### 6. 프로덕션 Secrets 설정

```bash
npx wrangler secret put YOUTUBE_API_KEY
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put BLOGGER_CLIENT_ID
npx wrangler secret put BLOGGER_CLIENT_SECRET
npx wrangler secret put BLOGGER_REFRESH_TOKEN
npx wrangler secret put BLOGGER_BLOG_ID
npx wrangler secret put DASHBOARD_PASSWORD
```

## 로컬 개발

```bash
# Worker 실행
npx wrangler dev

# Dashboard 실행 (별도 터미널)
cd dashboard && bun run dev
```

## 배포

### Worker 배포

```bash
npx wrangler deploy
```

### Dashboard 배포

```bash
cd dashboard
bun run build
npx wrangler pages deploy dist --project-name=youtube-blogger-dashboard
```

## API 엔드포인트

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/login` | 로그인 (JWT 발급) |
| GET | `/api/fetch-videos` | YouTube 영상 수집 |
| POST | `/api/generate-post` | AI 글 생성 |
| POST | `/api/publish` | Blogger 발행 |

## 프로젝트 구조

```
├── src/
│   ├── index.ts           # Main worker entry
│   ├── types.ts           # TypeScript types
│   ├── middleware/
│   │   └── auth.ts        # JWT authentication
│   ├── workers/
│   │   ├── youtube-fetcher.ts   # YouTube API
│   │   ├── ai-generator.ts      # Gemini API
│   │   ├── blogger-publisher.ts # Blogger API
│   │   └── scheduled.ts         # Cron handler
│   └── prompts/
│       ├── system.txt           # AI system prompt
│       ├── informational.txt    # 정보성 글 템플릿
│       └── promotional.txt      # 홍보성 글 템플릿
├── dashboard/             # React frontend
├── migrations/            # D1 schema
└── wrangler.toml         # Cloudflare config
```

## 라이선스

MIT
