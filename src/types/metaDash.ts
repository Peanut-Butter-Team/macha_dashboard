// Meta Dash API 타입 정의

// 공통 응답 래퍼
export interface MetaDashResponse<T> {
  responseName: string;
  responseCode: number;
  message: string;
  result: T;
}

// 1. 동기화 API 응답
export interface SyncResponse {
  responseName: string;
  responseCode: number;
  message: string;
  result: boolean[];
}

// 2. 회원 인사이트
export interface DashMemberInsight {
  id: string;
  metricName: string;  // 'website_clicks', 'profile_views', 'reach', 'impressions' 등
  period: string;      // 'day', 'week', 'days_28'
  title: string;
  dashMemberId: string;
  description: string;
  value: number;
  insightId: string;
  collectedAt: string; // ISO datetime
  time: string;        // ISO date (YYYY-MM-DD)
}

// 3. 팔로워 기록
export interface DashFollower {
  id: string;
  dashMemberId: string;
  followersCount: number;
  time: string;        // ISO date (YYYY-MM-DD)
}

// 4. 팔로워 인사이트 (이미 집계된 인구통계 데이터)
export interface DashFollowerInsight {
  id: string;
  dashMemberId: string;
  time: string;        // ISO date
  gender: {
    female: number;
    male: number;
    unknown: number;
  };
  age: {
    age13_17: number;
    age18_24: number;
    age25_34: number;
    age35_44: number;
    age45_54: number;
    age55_64: number;
    age65Plus: number;
  };
  country: {
    countries: {
      [countryCode: string]: number;  // { "KR": 5000, "US": 2000, ... }
    };
  };
}

// 5. 미디어
export interface DashMedia {
  id: string;
  dashMemberId: string;
  igMediaId: string;
  time: string;        // ISO date
  caption: string;
  mediaType: string;   // 'IMAGE', 'VIDEO', 'CAROUSEL_ALBUM', 'REELS'
  mediaUrl: string;
  thumbnailUrl: string;
  likeCount: number;
  commentsCount: number;
  postedAt: string;    // ISO datetime
}

// 6. 미디어 인사이트
export interface DashMediaInsight {
  id: string;
  mediaId: string;
  igMediaId: string;
  name: string;        // 실제 metricName ('impressions', 'reach', 'likes', 'comments', 'saved', 'plays', 'shares')
  period: string;
  title: string;
  description: string;
  value: number;
  time: string;        // ISO date
}

// 7. 미디어 응답 (미디어 + 인사이트)
export interface DashMediaResponse {
  dashMedia: DashMedia;
  dashMediaInsights: DashMediaInsight[];
}
