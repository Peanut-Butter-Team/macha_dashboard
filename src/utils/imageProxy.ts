/**
 * 이미지 URL 처리 유틸리티
 *
 * Instagram CDN 이미지는 서버 프록시를 통해 로드
 * CORS 및 만료 문제 일부 우회 가능
 *
 * TODO: 장기적으로 Apify 수집 시 이미지를 S3/Cloudinary에 저장하는 방식으로 전환 필요
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * 이미지 URL을 프록시 URL로 변환
 *
 * @param url - 원본 이미지 URL
 * @returns Instagram CDN URL인 경우 프록시 URL, 그 외에는 원본 URL
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return '';

  // Instagram CDN URL인 경우 프록시 사용
  if (url.includes('cdninstagram.com') || url.includes('instagram.com') || url.includes('fbcdn.net')) {
    return `${API_BASE_URL}/api/image-proxy?url=${encodeURIComponent(url)}`;
  }

  return url;
}
