import { Calendar } from 'lucide-react';
import { useState } from 'react';
import type { PeriodType } from '../../types';

interface PeriodFilterProps {
  period: PeriodType;
  onChange: (period: PeriodType) => void;
  customDateRange?: { start: string; end: string };
  onCustomDateChange?: (start: string, end: string) => void;
}

export function PeriodFilter({ period, onChange, customDateRange, onCustomDateChange }: PeriodFilterProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {[
        { key: 'daily', label: '일간' },
        { key: 'weekly', label: '주간' },
        { key: 'monthly', label: '월간' },
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => {
            onChange(key as PeriodType);
            setShowDatePicker(false);
          }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            period === key
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {label}
        </button>
      ))}

      {/* 직접 설정 버튼 */}
      <div className="relative">
        <button
          onClick={() => {
            onChange('custom');
            setShowDatePicker(!showDatePicker);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            period === 'custom'
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calendar size={16} />
          직접 설정
        </button>

        {/* 날짜 선택 드롭다운 */}
        {showDatePicker && period === 'custom' && customDateRange && onCustomDateChange && (
          <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">시작일</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => onCustomDateChange(e.target.value, customDateRange.end)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">종료일</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => onCustomDateChange(customDateRange.start, e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <button
                onClick={() => setShowDatePicker(false)}
                className="mt-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                적용
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 선택된 기간 표시 */}
      {period === 'custom' && customDateRange && (
        <span className="text-sm text-slate-500 ml-2">
          {customDateRange.start} ~ {customDateRange.end}
        </span>
      )}
    </div>
  );
}
