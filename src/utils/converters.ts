/**
 * 데이터 변환 유틸리티
 * API 응답 값을 UI에서 사용하는 형식으로 변환
 */

/**
 * 국가 코드를 한글 이름으로 변환
 * @param code - ISO 3166-1 alpha-2 국가 코드
 * @returns 한글 국가명 (매핑되지 않은 코드는 원본 반환)
 * @example
 * getCountryName('KR') // "한국"
 * getCountryName('US') // "미국"
 * getCountryName('XX') // "XX" (매핑 없음)
 */
export const getCountryName = (code: string): string => {
  const countryNames: Record<string, string> = {
    KR: '한국',
    US: '미국',
    JP: '일본',
    CN: '중국',
    TW: '대만',
    HK: '홍콩',
    SG: '싱가포르',
    TH: '태국',
    VN: '베트남',
    ID: '인도네시아',
    PH: '필리핀',
    MY: '말레이시아',
    IN: '인도',
    AU: '호주',
    GB: '영국',
    DE: '독일',
    FR: '프랑스',
    CA: '캐나다',
    BR: '브라질',
    MX: '멕시코',
  };
  return countryNames[code] || code;
};

/**
 * API 미디어 타입을 UI 타입으로 변환
 * @param apiType - API 응답의 미디어 타입 (IMAGE, VIDEO, REEL, CAROUSEL_ALBUM, STORY 등)
 * @returns UI에서 사용하는 미디어 타입
 * @example
 * mapMediaType('REEL') // "reels"
 * mapMediaType('VIDEO') // "reels"
 * mapMediaType('CAROUSEL_ALBUM') // "carousel"
 * mapMediaType('IMAGE') // "feed"
 */
export const mapMediaType = (apiType: string): 'reels' | 'feed' | 'story' | 'carousel' => {
  const normalized = (apiType || '').toUpperCase();
  if (normalized.includes('REEL')) return 'reels';
  if (normalized.includes('VIDEO')) return 'reels';      // VIDEO → reels
  if (normalized.includes('CAROUSEL')) return 'carousel'; // CAROUSEL → carousel
  if (normalized.includes('STORY')) return 'story';
  return 'feed';  // IMAGE → feed
};

/**
 * API 광고 상태를 UI 상태로 변환
 * @param apiStatus - API 응답의 광고 상태 (ACTIVE, PAUSED 등)
 * @returns UI에서 사용하는 상태 값
 * @example
 * mapAdStatus('ACTIVE') // "active"
 * mapAdStatus('PAUSED') // "paused"
 * mapAdStatus('COMPLETED') // "completed"
 */
export const mapAdStatus = (apiStatus: string): 'active' | 'paused' | 'completed' => {
  const s = (apiStatus || '').toUpperCase();
  if (s === 'ACTIVE') return 'active';
  if (s === 'PAUSED') return 'paused';
  return 'completed';
};
