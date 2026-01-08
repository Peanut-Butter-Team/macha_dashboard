# Instagram 데이터 자동 동기화 가이드

## 📋 개요

Apify를 사용하여 인플루언서들의 실제 Instagram 데이터를 자동으로 수집하고 Notion DB에 업데이트하는 시스템입니다.

## 🔧 Notion DB 필수 필드 설정

Notion 인플루언서 데이터베이스에 다음 필드들을 추가해야 합니다:

### 기존 필드 (이미 있음)
- `이름` (Title)
- `인스타그램 프로필` (Text) - 예: @username
- `팔로워 수` (Text)
- `활동 분야` (Multi-select)
- `이메일` (Text)
- `연락처` (Phone)
- `희망 보상` (Multi-select)
- `상태` (Status)

### 새로 추가할 필드
1. **평균 좋아요** (Number) - 최근 12개 게시물의 평균 좋아요 수
2. **평균 댓글** (Number) - 최근 12개 게시물의 평균 댓글 수
3. **참여율** (Number) - 실제 참여율 (좋아요+댓글)/팔로워*100
4. **프로필 이미지 URL** (URL) - Instagram 프로필 이미지 링크

## 🚀 설정 방법

### 1. Apify API 토큰 발급

1. [Apify](https://apify.com) 회원가입 (무료 플랜 가능)
2. Settings → Integrations → API tokens
3. 새 토큰 생성 후 복사

### 2. 환경 변수 설정

`.env` 파일에 Apify API 토큰 추가:

\`\`\`env
APIFY_API_TOKEN=your_actual_apify_token_here
\`\`\`

Vercel 환경 변수에도 추가:
\`\`\`bash
vercel env add APIFY_API_TOKEN
\`\`\`

### 3. Notion DB 필드 추가

Notion 인플루언서 데이터베이스에서:
1. 우측 상단 "Properties" 클릭
2. "+ Add a property" 클릭
3. 다음 필드들 추가:
   - **평균 좋아요**: Type = Number
   - **평균 댓글**: Type = Number
   - **참여율**: Type = Number, Format = Percent (선택)
   - **프로필 이미지 URL**: Type = URL

## 📊 사용 방법

### API 엔드포인트

**POST** `/api/sync-instagram-data`

Instagram 데이터를 수집하고 Notion DB를 업데이트합니다.

### 수동 실행

\`\`\`bash
curl -X POST https://macha-dashboard.vercel.app/api/sync-instagram-data
\`\`\`

또는 Postman/Insomnia에서:
- Method: POST
- URL: `https://macha-dashboard.vercel.app/api/sync-instagram-data`

### 응답 예시

\`\`\`json
{
  "message": "Instagram data sync completed",
  "total": 205,
  "updated": 203,
  "failed": 2
}
\`\`\`

## ⚙️ 자동 스케줄링 (선택)

Vercel Cron Jobs를 사용하여 주기적으로 자동 업데이트:

### vercel.json에 추가

\`\`\`json
{
  "crons": [{
    "path": "/api/sync-instagram-data",
    "schedule": "0 2 * * *"
  }]
}
\`\`\`

스케줄 옵션:
- `0 2 * * *` - 매일 오전 2시
- `0 2 * * 0` - 매주 일요일 오전 2시
- `0 2 1 * *` - 매월 1일 오전 2시

## 📈 수집되는 데이터

각 인플루언서마다:
- **팔로워 수**: 실제 Instagram 팔로워 수
- **평균 좋아요**: 최근 12개 게시물의 평균 좋아요 수
- **평균 댓글**: 최근 12개 게시물의 평균 댓글 수
- **참여율**: (평균 좋아요 + 평균 댓글) / 팔로워 * 100
- **프로필 이미지**: Instagram 프로필 이미지 URL

## 🔍 트러블슈팅

### "Instagram 핸들이 없습니다"
- Notion DB에 `인스타그램 프로필` 필드에 핸들(@username)이 입력되어 있는지 확인

### "Apify API 오류"
- `.env` 파일에 `APIFY_API_TOKEN`이 올바르게 설정되어 있는지 확인
- Apify 계정에 충분한 크레딧이 있는지 확인 (무료 플랜: 월 $5 크레딧)

### "Notion 업데이트 실패"
- Notion DB에 필수 필드들이 정확히 추가되어 있는지 확인
- 필드 이름이 정확히 일치하는지 확인 (대소문자 구분)

## 💰 비용

### Apify 무료 플랜
- 월 $5 크레딧 제공
- Instagram Profile Scraper: 약 $0.02 per 1000 profiles
- 205명 인플루언서: 약 $0.004 per run
- 매일 업데이트 시: 약 $0.12/월 (무료 플랜으로 충분)

## 📝 참고 사항

- Instagram API 제한으로 인해 한 번에 너무 많은 요청을 보내면 차단될 수 있습니다
- Apify가 자동으로 속도 제한을 관리합니다
- 첫 실행 시 1-2분 정도 소요될 수 있습니다
- 수집된 데이터는 Notion DB에 즉시 반영됩니다
