
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { RevenueEntry } from '../types';
import { Calendar, Edit2, Check } from 'lucide-react';

interface StatsOverviewProps {
  entries: RevenueEntry[];
  targetAmount: number;
  targetDate: string;
  onUpdateTargetDate: (date: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  entries, 
  targetAmount, 
  targetDate,
  onUpdateTargetDate 
}) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(targetDate);

  const stats = useMemo(() => {
    const now = new Date();
    // Normalize today to start of day for accurate day diffs
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Calculate Total Revenue
    const totalRevenue = entries.reduce((sum, e) => sum + e.amount, 0);

    // 2. Calculate Current Average Daily Income
    // Find the earliest entry date
    let firstDate = today;
    if (entries.length > 0) {
        const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const first = new Date(sorted[0].date);
        // Normalize
        firstDate = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    }

    // Days passed since first entry (inclusive)
    const timeDiffPassed = today.getTime() - firstDate.getTime();
    // Ensure at least 1 day to avoid division by zero
    const daysPassed = Math.max(1, Math.floor(timeDiffPassed / (1000 * 3600 * 24)) + 1);
    
    const avgDailyIncome = totalRevenue / daysPassed;

    // 3. Calculate Required Daily Average
    const target = new Date(targetDate);
    const timeDiffRemaining = target.getTime() - today.getTime();
    const daysRemaining = Math.max(1, Math.ceil(timeDiffRemaining / (1000 * 3600 * 24)));
    
    const remainingAmount = Math.max(0, targetAmount - totalRevenue);
    const requiredDaily = remainingAmount / daysRemaining;

    return {
        avgDailyIncome,
        requiredDaily,
        daysRemaining
    };
  }, [entries, targetAmount, targetDate]);

  const handleSaveDate = () => {
    if (tempDate) {
        onUpdateTargetDate(tempDate);
    }
    setIsEditingDate(false);
  };

  return (
    <div className="bg-[#EBF3F9] rounded-3xl p-8 border border-blue-100/50 shadow-sm">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-blue-200/30 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm overflow-hidden">
            
            {/* Left: Current Average Daily Income */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center hover:bg-white/40 transition-colors">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">当前平均日收入</h4>
                <div className="text-3xl font-black text-gray-900 tracking-tight">
                    ¥{stats.avgDailyIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="mt-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Based on history
                </div>
            </div>

            {/* Center: Required Daily Average */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center hover:bg-white/40 transition-colors relative group">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">达成目标所需日均</h4>
                <div className="text-3xl font-black text-blue-600 tracking-tight">
                    ¥{stats.requiredDaily.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                 <div className="mt-2 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {stats.daysRemaining} days left
                </div>
            </div>

            {/* Right: Estimated Completion Date (Target Date) */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center hover:bg-white/40 transition-colors">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1 justify-center">
                    预计完成时间
                </h4>
                
                {isEditingDate ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <input 
                            type="date" 
                            value={tempDate}
                            onChange={(e) => setTempDate(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            onClick={handleSaveDate}
                            className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div 
                        className="group cursor-pointer relative"
                        onClick={() => {
                            setTempDate(targetDate);
                            setIsEditingDate(true);
                        }}
                    >
                        <div className="text-3xl font-black text-gray-900 tracking-tight decoration-dashed decoration-gray-300 underline-offset-4 group-hover:underline">
                            {targetDate.replace(/-/g, '.')}
                        </div>
                        <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
