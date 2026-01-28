/**
 * 이미지 URL 처리 유틸리티
 *
 * S3/CloudFront 상대 경로를 완전한 URL로 변환
 * Instagram/Facebook CDN URL은 서버 프록시를 통해 요청
 */

// CloudFront 베이스 URL
const CLOUDFRONT_BASE_URL = 'https://d2xwq3y8g7dpg3.cloudfront.net';

// Instagram API URL (로컬 서버 전용 - 프로덕션 서버에는 없음)
const INSTAGRAM_API_URL = import.meta.env.VITE_INSTAGRAM_API_URL || 'http://localhost:3001';

/**
 * 이미지 URL을 적절한 형식으로 변환
 *
 * @param url - 원본 이미지 URL
 * @returns 변환된 이미지 URL
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return '';

  // S3/CloudFront 상대 경로인 경우 베이스 URL 추가
  if (url.startsWith('/matcha/')) {
    return `${CLOUDFRONT_BASE_URL}${url}`;
  }

  // Instagram/Facebook CDN → 현재 접근 불가로 빈 문자열 반환 (fallback 표시)
  if (url.includes('instagram') || url.includes('fbcdn') || url.includes('cdninstagram')) {
    return '';
  }

  return url;
}

/**
 * Instagram CDN URL인지 확인
 */
export function isInstagramCdnUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('instagram') || url.includes('fbcdn') || url.includes('cdninstagram');
}

/**
 * Instagram 프로필 이미지 API URL 생성
 * @param username - Instagram 사용자명
 */
export function getInstagramProfileImageUrl(username: string | null | undefined): string {
  if (!username) return '';
  return `${INSTAGRAM_API_URL}/api/instagram-profile?username=${encodeURIComponent(username.trim())}`;
}

/**
 * Instagram 게시물 이미지 API URL 생성
 * @param shortCode - Instagram 게시물 shortCode
 */
export function getInstagramPostImageUrl(shortCode: string | null | undefined): string {
  if (!shortCode) return '';
  return `${INSTAGRAM_API_URL}/api/instagram-post?shortCode=${encodeURIComponent(shortCode.trim())}`;
}
