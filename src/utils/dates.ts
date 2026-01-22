/**
 * 날짜 포맷팅 유틸리티
 */

/**
 * 로컬 시간 기준 날짜 문자열 반환
 * @param date - Date 객체
 * @returns YYYY-MM-DD 형식 문자열
 * @example
 * getLocalDateString(new Date('2024-01-22T15:30:00')) // "2024-01-22"
 */
export const getLocalDateString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * ISO 날짜를 M/D 형식으로 변환
 * @param isoDate - ISO 8601 형식 날짜 문자열
 * @returns "M/D" 형식 (예: "1/22")
 * @example
 * formatDateToMMDD('2024-01-22T00:00:00') // "1/22"
 * formatDateToMMDD('2024-12-05T00:00:00') // "12/5"
 */
export const formatDateToMMDD = (isoDate: string): string => {
  const date = new Date(isoDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};
