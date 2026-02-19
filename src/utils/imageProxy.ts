/**
 * 이미지 URL 처리 유틸리티
 *
 * S3/CloudFront 경로를 완전한 CloudFront URL로 변환
 */

// CloudFront 베이스 URL
const CLOUDFRONT_BASE_URL = 'https://d2xwq3y8g7dpg3.cloudfront.net';

// S3 URL 패턴 (virtual-hosted style: bucket.s3.region.amazonaws.com/key)
const S3_URL_PATTERN = /https?:\/\/[^/]*\.s3[.\-][^/]*\.amazonaws\.com\/(.+)/;
// S3 URL 패턴 (path style: s3.region.amazonaws.com/bucket/key)
const S3_PATH_STYLE_PATTERN = /https?:\/\/s3[.\-][^/]*\.amazonaws\.com\/[^/]+\/(.+)/;

// API 베이스 URL (프로덕션에서는 상대 경로, 로컬에서는 localhost:3001)
const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3001';

/**
 * 이미지 URL을 적절한 형식으로 변환
 *
 * - 이미 CloudFront URL이면 그대로 반환
 * - 상대 경로(/matcha/...)는 CloudFront URL로 변환
 * - 전체 S3 URL은 경로 추출 후 CloudFront URL로 변환
 * - 그 외(Instagram CDN 등)는 그대로 반환
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return '';

  // 이미 CloudFront URL이면 그대로 반환
  if (url.includes('d2xwq3y8g7dpg3.cloudfront.net')) return url;

  // S3/CloudFront 상대 경로인 경우 베이스 URL 추가
  if (url.startsWith('/matcha/') || url.startsWith('matcha/')) {
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${CLOUDFRONT_BASE_URL}${path}`;
  }

  // 전체 S3 URL → 경로 추출 → CloudFront URL
  const virtualHostMatch = url.match(S3_URL_PATTERN);
  if (virtualHostMatch) return `${CLOUDFRONT_BASE_URL}/${virtualHostMatch[1]}`;

  const pathStyleMatch = url.match(S3_PATH_STYLE_PATTERN);
  if (pathStyleMatch) return `${CLOUDFRONT_BASE_URL}/${pathStyleMatch[1]}`;

  // 그 외(Instagram CDN 등)는 그대로 반환
  return url;
}

/**
 * S3/CloudFront 경로인지 확인
 */
export function isS3Path(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith('/matcha/') ||
    url.startsWith('matcha/') ||
    url.includes('d2xwq3y8g7dpg3.cloudfront.net') ||
    S3_URL_PATTERN.test(url) ||
    S3_PATH_STYLE_PATTERN.test(url)
  );
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
