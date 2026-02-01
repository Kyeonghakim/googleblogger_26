# YouTube → Blogger 자동 포스팅 시스템

## TL;DR

> **Quick Summary**: 글로벌 경제/금융/재테크 유튜브 영상을 참고해 AI가 자연스러운 블로그 글을 자동 생성하고, 팀원이 검토 후 Google Blogger에 발행하는 시스템
> 
> **Deliverables**:
> - Cloudflare Workers 백엔드 (유튜브 수집 + AI 글 생성)
> - Cloudflare Pages 대시보드 (검토/승인 UI)
> - D1 Database (초안 저장)
> - Blogger API 연동 (자동 발행)
> 
> **Estimated Effort**: Medium (2-3주)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: 프로젝트 설정 → API 연동 → 대시보드 → 배포

---

## Context

### Original Request
"Google Blogger 글 자동으로 올리는 프로그램 만들고 싶은데"
- 글로벌 경제/금융/재테크 유튜브 참고
- AI로 자동 생성
- AI 작성 티 안 나게
- 비개발자 팀원이 사용

### Interview Summary
**Key Discussions**:
- 사용자: 2-5명 비개발자 팀, 공유 비밀번호 인증
- 콘텐츠: 완전 자동 (AI가 주제도 선택), 정보성/홍보성 옵션, SEO 키워드
- 스타일: 하이브리드 톤, 경제블로그 참고, AI 티 안 나게
- 발행: 검토 후 승인
- 예산: 무료 위주 → Cloudflare 스택 선택

**Research Findings**:
- YouTube Data API: 일일 10,000 units 무료 (매일 2개 글에 충분)
- Blogger API: 완전 무료
- Gemini API: 무료 tier (하루 60 requests 이상)
- Cloudflare 전체 스택: 무료 tier 내 사용 가능

### Self-Conducted Gap Analysis

**질문하지 않았지만 중요한 사항들:**
1. YouTube 영상 자막 접근 방식 (YouTube API vs 3rd party)
2. 글 생성 실패 시 재시도 로직
3. Blogger OAuth 토큰 갱신 전략
4. 기존 블로그 글과의 중복 체크

**설정해야 할 Guardrails:**
1. 저작권 침해 방지 (영상 내용 그대로 복사 금지)
2. API 할당량 초과 방지
3. 스팸성 콘텐츠 방지

**Scope Creep 위험:**
1. 이미지 자동 생성 → 제외
2. 다중 소셜 플랫폼 → 제외
3. 고급 SEO 분석 → 제외

**검증이 필요한 가정:**
1. Gemini 무료 tier가 하루 2개 글 생성에 충분 → ✅ 충분
2. YouTube 자막 API 접근 가능 → captions API 또는 transcript 서비스 필요

---

## Work Objectives

### Core Objective
글로벌 경제/금융 유튜브 영상을 AI로 분석하여 자연스러운 블로그 글을 매일 2개씩 자동 생성하고, 
비개발자 팀원이 웹 대시보드에서 검토 후 Google Blogger에 발행하는 시스템 구축

### Concrete Deliverables
1. **Cloudflare Workers 백엔드**
   - YouTube 인기 영상 자동 수집 Worker
   - AI 글 생성 Worker (Gemini API)
   - Blogger 발행 Worker
   - Cron Trigger (매일 자동 실행)

2. **Cloudflare Pages 대시보드**
   - 비밀번호 로그인 페이지
   - 설정 페이지 (정보성/홍보성, SEO 키워드)
   - 초안 목록/상세 페이지
   - 수정/승인/거절 기능

3. **D1 Database**
   - 초안 테이블
   - 설정 테이블
   - 발행 히스토리 테이블

4. **API 연동**
   - YouTube Data API
   - Gemini API
   - Blogger API (OAuth 2.0)

### Definition of Done
- [ ] 매일 정해진 시간에 자동으로 초안 2개 생성됨
- [ ] 대시보드에서 초안 목록 확인 가능
- [ ] 초안 수정/승인/거절 가능
- [ ] 승인 시 Blogger에 즉시 발행됨
- [ ] 비밀번호로 대시보드 접근 제한됨

### Must Have
- YouTube 경제/금융 영상 자동 탐색
- AI 글 생성 (자연스러운 스타일)
- 정보성/홍보성 선택 옵션
- SEO 키워드 설정
- 검토 대시보드
- 공유 비밀번호 인증
- Blogger 자동 발행
- 매일 자동 실행

### Must NOT Have (Guardrails)
- ❌ 유튜브 영상 내용 그대로 복사 (저작권 침해)
- ❌ 이미지 자동 생성
- ❌ 다중 블로그 지원
- ❌ 다중 소셜 플랫폼 연동
- ❌ 개인별 계정 관리
- ❌ 역할 기반 권한 시스템
- ❌ 고급 SEO 분석 도구
- ❌ AI가 쓴 티 나는 표현 (기계적 나열, 전형적 시작문구)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (새 프로젝트)
- **User wants tests**: Manual-only (비개발자 팀)
- **Framework**: None

### Automated Verification (ZERO User Intervention)

각 TODO는 에이전트가 직접 실행할 수 있는 검증 절차 포함:

**API 검증**: curl 명령으로 응답 확인
**UI 검증**: Playwright로 브라우저 자동화
**DB 검증**: Wrangler CLI로 D1 쿼리

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: 프로젝트 초기 설정 (Cloudflare)
└── Task 2: API 키 발급 및 설정 (YouTube, Gemini, Blogger)

Wave 2 (After Wave 1):
├── Task 3: D1 Database 스키마 설계 및 생성
├── Task 4: YouTube 영상 수집 Worker
└── Task 5: AI 글 생성 프롬프트 개발

Wave 3 (After Wave 2):
├── Task 6: AI 글 생성 Worker
├── Task 7: Blogger 발행 Worker
└── Task 8: 대시보드 UI (Pages)

Wave 4 (After Wave 3):
├── Task 9: Cron Trigger 설정
└── Task 10: 비밀번호 인증 구현

Wave 5 (Final):
└── Task 11: 통합 테스트 및 배포
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3,4,5,6,7,8 | 2 |
| 2 | None | 4,6,7 | 1 |
| 3 | 1 | 6,7,8 | 4, 5 |
| 4 | 1, 2 | 6 | 3, 5 |
| 5 | None | 6 | 3, 4 |
| 6 | 3, 4, 5 | 9 | 7, 8 |
| 7 | 2, 3 | 9 | 6, 8 |
| 8 | 3 | 10 | 6, 7 |
| 9 | 6, 7 | 11 | 10 |
| 10 | 8 | 11 | 9 |
| 11 | 9, 10 | None | None |

---

## TODOs

### Phase 1: 기반 설정

- [x] 1. 프로젝트 초기 설정

  **What to do**:
  - Cloudflare 계정 확인/생성
  - Wrangler CLI 설치 및 인증
  - 프로젝트 디렉토리 구조 생성
  - wrangler.toml 설정 파일 작성
  - D1 database 생성
  - package.json 초기화

  **Must NOT do**:
  - 불필요한 의존성 추가
  - 복잡한 빌드 설정

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 설정 작업, 복잡한 로직 없음
  - **Skills**: [`git-master`]
    - `git-master`: 초기 커밋 생성

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: 3, 4, 5, 6, 7, 8
  - **Blocked By**: None

  **References**:
  - Cloudflare Workers 공식 문서: https://developers.cloudflare.com/workers/
  - Wrangler 설정: https://developers.cloudflare.com/workers/wrangler/configuration/
  - D1 시작하기: https://developers.cloudflare.com/d1/get-started/

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  wrangler --version
  # Assert: 버전 출력됨

  ls -la
  # Assert: wrangler.toml, package.json 존재

  wrangler d1 list
  # Assert: youtube-blogger-db 존재
  ```

  **Commit**: YES
  - Message: `chore: initialize cloudflare project structure`
  - Files: `wrangler.toml`, `package.json`, `src/`


- [x] 2. API 키 발급 및 환경 설정

  **What to do**:
  - Google Cloud Console에서 프로젝트 생성
  - YouTube Data API v3 활성화 및 API 키 발급
  - Gemini API 키 발급 (Google AI Studio - https://aistudio.google.com/)
  - Blogger API 활성화 및 OAuth 2.0 credentials 생성
    - OAuth consent screen 설정 (External, 테스트 모드)
    - OAuth 2.0 Client ID 생성 (Web application)
    - Redirect URI 설정: https://youtube-blogger.{subdomain}.workers.dev/oauth/callback
    - 초기 refresh token 발급 (OAuth Playground 또는 수동 flow)
  - Cloudflare secrets 설정 (wrangler secret)
    - YOUTUBE_API_KEY
    - GEMINI_API_KEY  
    - BLOGGER_CLIENT_ID
    - BLOGGER_CLIENT_SECRET
    - BLOGGER_REFRESH_TOKEN
    - DASHBOARD_PASSWORD
  - .dev.vars 파일 생성 (로컬 개발용)

  **Must NOT do**:
  - API 키를 코드에 하드코딩
  - .dev.vars를 git에 커밋

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 설정 작업, 브라우저 조작 필요할 수 있음
  - **Skills**: [`playwright`]
    - `playwright`: Google Console 접근 시 필요할 수 있음

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: 4, 6, 7
  - **Blocked By**: None

  **References**:
  - YouTube API 시작하기: https://developers.google.com/youtube/v3/getting-started
  - Gemini API: https://ai.google.dev/tutorials/setup
  - Blogger API: https://developers.google.com/blogger/docs/3.0/using
  - Cloudflare Secrets: https://developers.cloudflare.com/workers/configuration/secrets/

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  wrangler secret list
  # Assert: YOUTUBE_API_KEY, GEMINI_API_KEY, BLOGGER_CLIENT_ID 등 존재

  cat .dev.vars
  # Assert: 필요한 키들이 설정됨 (값은 마스킹)
  ```

  **Commit**: YES
  - Message: `chore: configure API keys and secrets`
  - Files: `.dev.vars.example`, `.gitignore`


### Phase 2: 데이터 및 수집

- [x] 3. D1 Database 스키마 설계 및 생성

  **What to do**:
  - 테이블 설계:
    - `drafts`: id, title, content, source_video_url, source_video_id, content_type (정보성/홍보성), seo_keywords, status (pending/approved/rejected), created_at, updated_at
    - `settings`: id, key, value (정보성/홍보성 기본값, SEO 키워드 목록 등)
    - `publish_history`: id, draft_id, blogger_post_id, published_at
  - 마이그레이션 SQL 파일 작성
  - D1에 테이블 생성
  - source_video_id에 UNIQUE 인덱스 추가 (중복 방지)

  **Must NOT do**:
  - 복잡한 관계형 구조
  - 불필요한 인덱스

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: SQL 스키마 작성, 단순 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: 6, 7, 8
  - **Blocked By**: 1

  **References**:
  - D1 SQL 레퍼런스: https://developers.cloudflare.com/d1/reference/sql-api/
  - SQLite 데이터 타입: https://www.sqlite.org/datatype3.html

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  wrangler d1 execute youtube-blogger-db --command "SELECT name FROM sqlite_master WHERE type='table';"
  # Assert: drafts, settings, publish_history 테이블 존재
  ```

  **Commit**: YES
  - Message: `feat(db): create D1 schema for drafts and settings`
  - Files: `migrations/`, `schema.sql`


- [x] 4. YouTube 영상 수집 Worker 개발

  **What to do**:
  - YouTube Data API로 경제/금융/재테크 인기 영상 검색
  - 검색 키워드 목록: ["금리", "주식", "부동산", "투자", "경제", "Fed", "inflation", "S&P500"]
  - 영상 정보 추출: title, description, videoId, channelTitle
  - 영상 자막/트랜스크립트 가져오기 (youtube-transcript 라이브러리 또는 직접 구현)
  - 중복 영상 필터링:
    - D1 drafts 테이블에서 source_video_url로 기존 사용 영상 조회
    - 이미 사용된 videoId는 건너뛰기
    - 새로운 영상만 반환

  **Must NOT do**:
  - 저작권 있는 콘텐츠 전체 복사
  - 너무 오래된 영상 수집 (24시간 이내로 제한)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: API 연동 + 비즈니스 로직 복잡
  - **Skills**: []
  
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: 6
  - **Blocked By**: 1, 2

  **References**:
  - YouTube Search API: https://developers.google.com/youtube/v3/docs/search/list
  - youtube-transcript npm: https://www.npmjs.com/package/youtube-transcript

  **Acceptance Criteria**:
  ```bash
  # Agent runs (로컬 테스트):
  wrangler dev --test-scheduled
  # 또는 curl로 Worker 호출

  curl http://localhost:8787/api/fetch-videos
  # Assert: JSON 응답에 videos 배열, 각 영상에 title, transcript 포함
  ```

  **Commit**: YES
  - Message: `feat(worker): implement YouTube video fetcher with transcript`
  - Files: `src/workers/youtube-fetcher.ts`


- [x] 5. AI 글 생성 프롬프트 개발

  **What to do**:
  - 시스템 프롬프트 작성 (AI 티 안 나는 글쓰기 지침)
  - 정보성 글 프롬프트 템플릿
  - 홍보성 글 프롬프트 템플릿
  - SEO 키워드 삽입 로직
  - 프롬프트 테스트 및 개선

  **AI 글쓰기 지침 (프롬프트에 포함)**:
  ```
  - "~에 대해 알아보겠습니다" 같은 전형적 시작 금지
  - 문장 길이 다양하게 (10자~50자 섞기)
  - 개인 의견/관점 1-2개 자연스럽게 삽입
  - 구어체 표현 가끔 사용 ("솔직히", "사실", "근데")
  - 첫째, 둘째 나열 대신 자연스러운 흐름
  - 완벽한 결론 대신 생각할 거리 제시
  - 유명 경제 블로거 스타일 참고
  ```

  **Must NOT do**:
  - 영상 내용 그대로 번역/복사
  - 기계적인 요약

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 프롬프트 엔지니어링, 글쓰기 품질
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: 6
  - **Blocked By**: None

  **References**:
  - Gemini 프롬프트 가이드: https://ai.google.dev/docs/prompting_intro
  - 경제 블로그 예시: 삼프로TV, 슈카월드 등의 글쓰기 스타일

  **Acceptance Criteria**:
  - [ ] prompts/system.txt 존재
  - [ ] prompts/informational.txt 존재 (정보성)
  - [ ] prompts/promotional.txt 존재 (홍보성)
  - [ ] 테스트 생성된 글이 AI 티 안 남 (수동 검토)

  **Commit**: YES
  - Message: `feat(ai): develop natural writing prompts for blog generation`
  - Files: `src/prompts/`


### Phase 3: 핵심 기능

- [x] 6. AI 글 생성 Worker 개발

  **What to do**:
  - Gemini API 연동
  - YouTube 영상 데이터 → 프롬프트 조합
  - 정보성/홍보성에 따른 프롬프트 선택
  - SEO 키워드 삽입
  - 생성된 글을 D1 drafts 테이블에 저장
  - 에러 핸들링 및 재시도 로직

  **Must NOT do**:
  - API 키 노출
  - 할당량 초과 시 무한 재시도

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: API 연동 + DB 저장 + 에러 핸들링
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: 9
  - **Blocked By**: 3, 4, 5

  **References**:
  - Gemini API 호출: https://ai.google.dev/api/rest/v1/models/generateContent
  - D1 바인딩: https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  curl -X POST http://localhost:8787/api/generate-post \
    -H "Content-Type: application/json" \
    -d '{"videoId": "test123", "contentType": "informational"}'
  # Assert: 200 OK, 응답에 draftId 포함

  wrangler d1 execute youtube-blogger-db --command "SELECT COUNT(*) FROM drafts;"
  # Assert: 카운트가 이전보다 1 증가
  ```

  **Commit**: YES
  - Message: `feat(worker): implement AI blog post generation with Gemini`
  - Files: `src/workers/ai-generator.ts`


- [x] 7. Blogger 발행 Worker 개발

  **What to do**:
  - Blogger API OAuth 2.0 인증 구현
  - Refresh token 자동 갱신 로직
  - 초안을 Blogger 포스트로 변환
  - 발행 후 publish_history 테이블 업데이트
  - 발행 성공/실패 상태 처리

  **Must NOT do**:
  - OAuth token을 로그에 출력
  - 발행 실패 시 초안 삭제

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: OAuth 복잡한 인증 흐름
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 8)
  - **Blocks**: 9
  - **Blocked By**: 2, 3

  **References**:
  - Blogger API Posts: https://developers.google.com/blogger/docs/3.0/reference/posts
  - OAuth 2.0 for Server: https://developers.google.com/identity/protocols/oauth2/web-server

  **Acceptance Criteria**:
  ```bash
  # Agent runs (실제 발행 대신 dry-run 모드로 테스트):
  curl -X POST http://localhost:8787/api/publish \
    -H "Content-Type: application/json" \
    -d '{"draftId": 1, "dryRun": true}'
  # Assert: 200 OK, 응답에 wouldPublish: true

  # 실제 발행 테스트 (테스트 블로그에):
  # Assert: Blogger에 포스트 생성됨
  ```

  **Commit**: YES
  - Message: `feat(worker): implement Blogger publishing with OAuth`
  - Files: `src/workers/blogger-publisher.ts`


- [x] 8. 대시보드 UI 개발 (Cloudflare Pages)

  **What to do**:
  - React/Vue/Svelte 중 택1 (또는 vanilla)
  - 페이지 구성:
    - `/login`: 비밀번호 입력
    - `/`: 초안 목록 (pending 상태)
    - `/drafts/:id`: 초안 상세 보기/수정
    - `/settings`: 정보성/홍보성 기본값, SEO 키워드 설정
    - `/history`: 발행 히스토리
  - 승인/거절 버튼
  - 실시간 상태 업데이트

  **Must NOT do**:
  - 복잡한 상태 관리 라이브러리
  - 과도한 애니메이션
  - 모바일 최적화 (초기에는)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI/UX 개발
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 깔끔한 대시보드 디자인

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7)
  - **Blocks**: 10
  - **Blocked By**: 3

  **References**:
  - Cloudflare Pages: https://developers.cloudflare.com/pages/
  - Pages Functions: https://developers.cloudflare.com/pages/functions/

  **Acceptance Criteria**:
  ```
  # Agent executes via playwright:
  1. Navigate to: http://localhost:8788/
  2. Assert: 로그인 페이지 표시됨
  3. Fill: password input with "testpass"
  4. Click: 로그인 버튼
  5. Wait for: 초안 목록 페이지
  6. Assert: "초안 목록" 텍스트 존재
  7. Screenshot: .sisyphus/evidence/dashboard-home.png
  ```

  **Commit**: YES
  - Message: `feat(ui): implement dashboard for draft review and publishing`
  - Files: `dashboard/`


### Phase 4: 자동화 및 보안

- [x] 9. Cron Trigger 설정

  **What to do**:
  - wrangler.toml에 Cron Trigger 설정
  - 매일 오전 9시, 오후 3시 실행 (KST)
  - Cron 핸들러: YouTube 수집 → AI 생성 → D1 저장
  - 하루 2개 초안 생성 보장
  - 실행 로그 기록

  **Must NOT do**:
  - 초당 여러 번 실행되는 스케줄
  - 로그에 민감 정보 포함

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 설정 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 10)
  - **Blocks**: 11
  - **Blocked By**: 6, 7

  **References**:
  - Cron Triggers: https://developers.cloudflare.com/workers/configuration/cron-triggers/

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  cat wrangler.toml | grep -A3 "triggers"
  # Assert: crons 배열에 스케줄 존재

  wrangler dev --test-scheduled
  # Assert: scheduled 이벤트 시뮬레이션 성공
  ```

  **Commit**: YES
  - Message: `feat(worker): configure cron triggers for daily post generation`
  - Files: `wrangler.toml`, `src/workers/scheduled.ts`


- [x] 10. 비밀번호 인증 구현

  **What to do**:
  - 환경 변수에서 DASHBOARD_PASSWORD 읽기
  - 로그인 API 엔드포인트
  - JWT 또는 세션 쿠키 발급
  - 보호된 API 라우트에 인증 미들웨어 적용
  - 로그아웃 기능

  **Must NOT do**:
  - 비밀번호 평문 저장
  - 토큰 만료 없이 영구 세션

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 간단한 인증 로직
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 9)
  - **Blocks**: 11
  - **Blocked By**: 8

  **References**:
  - Cloudflare Workers KV for sessions: https://developers.cloudflare.com/kv/
  - jose JWT 라이브러리: https://www.npmjs.com/package/jose

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  curl -X POST http://localhost:8787/api/login \
    -H "Content-Type: application/json" \
    -d '{"password": "wrong"}'
  # Assert: 401 Unauthorized

  curl -X POST http://localhost:8787/api/login \
    -H "Content-Type: application/json" \
    -d '{"password": "correct"}'
  # Assert: 200 OK, Set-Cookie 헤더 존재
  ```

  **Commit**: YES
  - Message: `feat(auth): implement shared password authentication`
  - Files: `src/middleware/auth.ts`, `src/api/login.ts`


### Phase 5: 마무리

- [ ] 11. 통합 테스트 및 배포

  **What to do**:
  - 전체 플로우 E2E 테스트:
    1. Cron 트리거 시뮬레이션
    2. YouTube 영상 수집 확인
    3. AI 글 생성 확인
    4. 대시보드 접속 및 초안 확인
    5. 승인 후 Blogger 발행 확인
  - Cloudflare에 프로덕션 배포
  - 도메인 설정 (선택사항)
  - README 작성

  **Must NOT do**:
  - 테스트 없이 배포
  - 프로덕션에 디버그 로그 남기기

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 전체 시스템 통합 검증
  - **Skills**: [`playwright`]
    - `playwright`: E2E 테스트

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 5 (final)
  - **Blocks**: None
  - **Blocked By**: 9, 10

  **References**:
  - Wrangler deploy: https://developers.cloudflare.com/workers/wrangler/commands/#deploy

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  wrangler deploy
  # Assert: 배포 성공

  curl https://youtube-blogger.your-subdomain.workers.dev/health
  # Assert: 200 OK
  ```

  ```
  # Agent executes via playwright (프로덕션):
  1. Navigate to: https://youtube-blogger-dashboard.pages.dev
  2. Login with password
  3. Verify drafts list loads
  4. Screenshot: .sisyphus/evidence/production-dashboard.png
  ```

  **Commit**: YES
  - Message: `chore: deploy to production`
  - Files: `README.md`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `chore: initialize cloudflare project` | wrangler.toml, package.json | wrangler --version |
| 2 | `chore: configure API secrets` | .dev.vars.example | wrangler secret list |
| 3 | `feat(db): create D1 schema` | migrations/ | D1 query |
| 4 | `feat: youtube fetcher worker` | src/workers/youtube-fetcher.ts | curl test |
| 5 | `feat: AI writing prompts` | src/prompts/ | manual review |
| 6 | `feat: AI generator worker` | src/workers/ai-generator.ts | curl test |
| 7 | `feat: blogger publisher` | src/workers/blogger-publisher.ts | curl test |
| 8 | `feat: dashboard UI` | dashboard/ | playwright test |
| 9 | `feat: cron triggers` | wrangler.toml | scheduled test |
| 10 | `feat: password auth` | src/middleware/ | curl test |
| 11 | `chore: production deploy` | README.md | deploy success |

---

## Success Criteria

### Verification Commands
```bash
# 1. 전체 Worker 상태 확인
wrangler deployments list
# Expected: 배포된 Worker 목록

# 2. D1 데이터 확인
wrangler d1 execute youtube-blogger-db --command "SELECT COUNT(*) as count FROM drafts;"
# Expected: count >= 0

# 3. 프로덕션 헬스체크
curl https://youtube-blogger.your-subdomain.workers.dev/health
# Expected: {"status": "ok"}
```

### Final Checklist
- [ ] 매일 자동으로 초안 2개 생성됨
- [ ] 대시보드에서 비밀번호로 로그인 가능
- [ ] 초안 목록/상세 보기/수정 가능
- [ ] 정보성/홍보성 선택 가능
- [ ] SEO 키워드 설정 가능
- [ ] 승인 시 Blogger에 발행됨
- [ ] AI 글이 자연스럽고 티 안 남
- [ ] 저작권 침해 없음 (원본 복사 X)
- [ ] API 키가 코드에 노출 안 됨
- [ ] 모든 환경변수가 Cloudflare secrets에 저장됨
