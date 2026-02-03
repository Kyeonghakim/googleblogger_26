# YouTube → Blogger 자동 포스팅 시스템

경제/금융/재테크 유튜브 영상을 참고해 AI가 **순수 정보성** 블로그 글을 자동 생성하고, Google Blogger에 발행하는 시스템입니다.

## 핵심 특징

- **순수 정보성 콘텐츠**: 광고/마케팅/CTA 요소 없이 오직 유익한 정보만 전달
- **AI 글 생성**: Gemini 2.0 Flash로 자연스러운 블로그 글 작성
- **Unsplash 이미지**: 고품질 무료 이미지 자동 삽입
- **대시보드**: 비개발자도 사용 가능한 웹 UI
- **자동 스케줄링**: 매일 2회 자동 실행 (9시, 15시 KST)

## 배포 정보

| 항목 | 값 |
|------|-----|
| Worker URL | https://googleblogger26.congratskim8860.workers.dev |
| 블로그 | https://ecotech88.blogspot.com |
| 대시보드 비밀번호 | `khkh4546` |

## 글 생성 정책

### 정보성 글 (기본)
- 광고성/홍보성 요소 **절대 금지**
- CTA(Call-to-Action) 없음
- 구독/좋아요 요청 없음
- 링크 클릭 유도 없음
- 제품/서비스 추천 없음
- **오직 독자에게 유익한 정보와 통찰만 전달**

### 홍보성 글 (수동 선택 시)
- 사용자가 대시보드에서 **'홍보성'** 타입을 직접 선택한 경우에만 CTA 포함
- 기본값은 항상 '정보성'

## 기술 스택

- **Backend**: Cloudflare Workers + D1 (SQLite)
- **Frontend**: React + Tailwind CSS
- **AI**: Google Gemini 2.0 Flash
- **이미지**: Unsplash API
- **APIs**: YouTube Data API, Blogger API

## 환경변수 (Cloudflare Secrets)

```
YOUTUBE_API_KEY=YouTube Data API 키
GEMINI_API_KEY=Gemini API 키
BLOGGER_CLIENT_ID=OAuth Client ID
BLOGGER_CLIENT_SECRET=OAuth Client Secret
BLOGGER_REFRESH_TOKEN=OAuth Refresh Token
BLOGGER_BLOG_ID=551809195468375575
DASHBOARD_PASSWORD=khkh4546
UNSPLASH_ACCESS_KEY=Unsplash API 키
```

## API 엔드포인트

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/login` | 로그인 (JWT 발급) |
| GET | `/api/drafts` | 초안 목록 조회 |
| GET | `/api/drafts/:id` | 초안 상세 조회 |
| PUT | `/api/drafts/:id` | 초안 수정 |
| DELETE | `/api/drafts/:id` | 초안 삭제 |
| GET | `/api/fetch-videos` | YouTube 영상 수집 |
| POST | `/api/generate-post` | AI 글 생성 |
| POST | `/api/publish` | Blogger 발행 |
| POST | `/api/run-scheduled` | 수동 스케줄 실행 |
| GET | `/api/history` | 발행 이력 조회 |

## 프로젝트 구조

```
├── src/
│   ├── index.ts                 # Main Worker entry
│   ├── types.ts                 # TypeScript types
│   ├── middleware/
│   │   └── auth.ts              # JWT authentication
│   ├── utils/
│   │   └── images.ts            # Unsplash 이미지 유틸
│   └── workers/
│       ├── youtube-fetcher.ts   # YouTube API
│       ├── ai-generator.ts      # Gemini AI 글 생성
│       ├── blogger-publisher.ts # Blogger API
│       └── scheduled.ts         # Cron handler
├── dashboard/                   # React frontend
├── migrations/                  # D1 schema
└── wrangler.toml               # Cloudflare config
```

## 개발

```bash
# 의존성 설치
bun install

# 로컬 실행
npx wrangler dev

# 배포
npx wrangler deploy
```

## 라이선스

MIT
