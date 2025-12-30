import { useState } from 'react';
import { Info } from 'lucide-react';
import { METRIC_DEFINITIONS } from '../../data/dummyData';

interface InfoTooltipProps {
  metricKey: string;
}

export function InfoTooltip({ metricKey }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const metric = METRIC_DEFINITIONS[metricKey];

  if (!metric) return null;

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="ml-1.5 text-slate-400 hover:text-primary-600 transition-colors"
        aria-label={`${metric.title} 설명 보기`}
      >
        <Info size={15} />
      </button>
      {isVisible && (
        <div className="absolute z-50 w-72 p-4 bg-primary-950 text-white text-sm rounded-xl shadow-xl -left-28 top-8 border border-primary-800">
          <div className="font-semibold mb-1.5 text-primary-200">{metric.title}</div>
          <div className="text-slate-300 text-xs leading-relaxed">{metric.description}</div>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-primary-950" />
        </div>
      )}
    </div>
  );
}
