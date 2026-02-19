/**
 * 이미지 URL 처리 유틸리티
 *
 * S3/CloudFront 상대 경로를 완전한 URL로 변환
 */

// CloudFront 베이스 URL
const CLOUDFRONT_BASE_URL = 'https://d2xwq3y8g7dpg3.cloudfront.net';

// API 베이스 URL (프로덕션에서는 상대 경로, 로컬에서는 localhost:3001)
const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3001';

/**
 * 이미지 URL을 적절한 형식으로 변환
 *
 * @param url - 원본 이미지 URL
 * @returns 변환된 이미지 URL
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return '';

  // S3/CloudFront 상대 경로인 경우 베이스 URL 추가
  if (url.startsWith('/matcha/') || url.startsWith('matcha/')) {
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${CLOUDFRONT_BASE_URL}${path}`;
  }

  // Instagram CDN URL은 그대로 반환 (프록시 제거)
  return url;
}

/**
 * S3/CloudFront 상대 경로인지 확인
 */
export function isS3Path(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('/matcha/') || url.startsWith('matcha/');
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
  return `${API_BASE}/api/instagram-profile?username=${encodeURIComponent(username.trim())}`;
}

/**
 * Instagram 게시물 이미지 API URL 생성
 * @param shortCode - Instagram 게시물 shortCode
 */
export function getInstagramPostImageUrl(shortCode: string | null | undefined): string {
  if (!shortCode) return '';
  return `${API_BASE}/api/instagram-post?shortCode=${encodeURIComponent(shortCode.trim())}`;
}
