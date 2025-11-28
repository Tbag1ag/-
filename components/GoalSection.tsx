
import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Check } from 'lucide-react';

interface GoalSectionProps {
  currentAmount: number;
  targetAmount: number;
  onUpdateTarget: (newTarget: number) => void;
}

export const GoalSection: React.FC<GoalSectionProps> = ({
  currentAmount,
  targetAmount,
  onUpdateTarget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetAmount.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const percentage = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
  const pDecimal = percentage / 100;

  // Generate markers every 20,000 (2w)
  const markerStep = 20000;
  const markers = [];
  for (let i = markerStep; i < targetAmount; i += markerStep) {
    markers.push(i);
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    const val = parseFloat(tempTarget);
    if (!isNaN(val) && val > 0) {
      onUpdateTarget(val);
    } else {
      setTempTarget(targetAmount.toString());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setTempTarget(targetAmount.toString());
      setIsEditing(false);
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('zh-CN');
  };

  const formatLabel = (val: number) => {
      if (val >= 10000) {
          return `${val / 10000}w`;
      }
      return val.toString();
  };

  // Interpolate color from Gray-400 (rgb(156, 163, 175)) to Black (rgb(0, 0, 0))
  // as percentage goes from 0 to 1
  const startColor = { r: 156, g: 163, b: 175 };
  const endColor = { r: 0, g: 0, b: 0 };
  
  const currentColor = {
      r: Math.round(startColor.r + (endColor.r - startColor.r) * pDecimal),
      g: Math.round(startColor.g + (endColor.g - startColor.g) * pDecimal),
      b: Math.round(startColor.b + (endColor.b - startColor.b) * pDecimal),
  };
  
  const currentTextColorStr = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;

  return (
    <div className="flex flex-col items-center justify-center py-6 relative">
      
      {/* Big Number Display - Current / Target */}
      <div className="relative group mt-4 w-full text-center">
        {isEditing ? (
          <div className="flex items-center justify-center gap-3">
            <input
              ref={inputRef}
              type="number"
              value={tempTarget}
              onChange={(e) => setTempTarget(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="text-[60px] md:text-[120px] font-black bg-transparent text-center text-gray-900 border-b-2 border-black focus:outline-none w-full max-w-4xl leading-none tracking-tight"
            />
            <button 
              onClick={handleSave}
              className="p-3 bg-black rounded-full hover:bg-gray-800 transition-colors shadow-lg"
            >
              <Check className="w-8 h-8 text-white" />
            </button>
          </div>
        ) : (
          <div 
            className="flex items-center justify-center gap-4 cursor-pointer flex-wrap"
            onClick={() => {
              setTempTarget(targetAmount.toString());
              setIsEditing(true);
            }}
          >
            {/* 120px font size as requested */}
            <h1 className="text-[60px] md:text-[100px] lg:text-[120px] font-black leading-none tracking-tight text-center break-all">
              <span 
                style={{ color: currentTextColorStr }}
                className="transition-colors duration-500"
              >
                {currentAmount.toLocaleString()}
              </span>
              {/* Pure black slash */}
              <span className="mx-2 md:mx-4 text-black font-light">/</span>
              <span className="text-gray-900">{targetAmount.toLocaleString()}</span>
            </h1>
            <div className="p-2 rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 mt-2 absolute -right-12 top-1/2 -translate-y-1/2 hidden xl:block">
                <Edit2 className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        )}
      </div>

      {/* Progress Stats */}
      <div className="mt-8 w-full max-w-5xl px-4 md:px-0">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-gray-900">¥{formatCurrency(currentAmount)}</span>
            <span className="text-sm font-normal text-gray-500">已达成</span>
          </div>
          <div className="text-right flex items-center gap-1">
             <span className="text-lg font-semibold text-gray-900">{percentage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Thicker Calm Progress Bar (h-8) with Blue-Violet Gradient */}
        <div className="relative">
            <div className="h-8 w-full bg-[#E5E7EB] rounded-full overflow-hidden relative z-0">
                <div 
                    className="h-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] transition-all duration-1000 ease-out relative"
                    style={{ width: `${percentage}%` }}
                >
                    {/* Subtle Gloss effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                </div>
            </div>

            {/* Markers Lines (Overlay) */}
            {markers.map((marker) => (
                <div 
                    key={marker}
                    className="absolute top-0 h-8 w-[1px] bg-white z-10 opacity-50 pointer-events-none"
                    style={{ left: `${(marker / targetAmount) * 100}%` }}
                />
            ))}

            {/* Labels below */}
            <div className="relative h-6 mt-2 w-full text-xs font-normal text-gray-400 select-none">
                <span className="absolute left-0">0</span>
                
                {markers.map((marker) => {
                    const pos = (marker / targetAmount) * 100;
                    // Only show label if it doesn't overlap with start/end too much
                    if (pos < 5 || pos > 95) return null; 
                    
                    return (
                        <span 
                            key={marker} 
                            className="absolute -translate-x-1/2" 
                            style={{ left: `${pos}%` }}
                        >
                            {formatLabel(marker)}
                        </span>
                    );
                })}

                <span className="absolute right-0">{formatLabel(targetAmount)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};
