import React, { useMemo } from 'react';
import { RevenueEntry } from '../types';
import * as d3 from 'd3';
import { BarChart3 } from 'lucide-react';

interface WeeklyChartProps {
  entries: RevenueEntry[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ entries }) => {
  const weeklyData = useMemo(() => {
    // 1. Group data by week
    const weeksMap = new Map<string, number>();
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      // Get the Monday of the week
      const monday = d3.timeMonday(date);
      // Format as YYYY-MM-DD for key
      const key = monday.toISOString().split('T')[0];
      
      const current = weeksMap.get(key) || 0;
      weeksMap.set(key, current + entry.amount);
    });

    // 2. Convert to array and fill in missing weeks for the last 10 weeks
    const today = new Date();
    const currentMonday = d3.timeMonday(today);
    const result = [];

    // Look back 8 weeks
    for (let i = 7; i >= 0; i--) {
      const d = d3.timeMonday.offset(currentMonday, -i);
      const key = d.toISOString().split('T')[0];
      result.push({
        date: key,
        displayDate: `${d.getMonth() + 1}/${d.getDate()}`, // e.g., 10/24
        amount: weeksMap.get(key) || 0
      });
    }

    return result;
  }, [entries]);

  const maxAmount = Math.max(...weeklyData.map(d => d.amount), 100); // Avoid div by zero

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg">
          <BarChart3 className="w-4 h-4" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">周度收益趋势</h3>
      </div>

      <div className="flex-1 flex items-end gap-3 min-h-[150px]">
        {weeklyData.map((week) => {
          const heightPercent = (week.amount / maxAmount) * 100;
          return (
            <div key={week.date} className="flex-1 flex flex-col items-center gap-2 group">
              {/* Tooltipish value */}
              <div className="text-[10px] font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                ¥{week.amount > 1000 ? (week.amount/1000).toFixed(1) + 'k' : week.amount}
              </div>
              
              {/* The Bar */}
              <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden h-[120px] flex items-end">
                 <div 
                    className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 ease-out group-hover:bg-blue-600"
                    style={{ height: `${Math.max(heightPercent, 2)}%` }} // Min height 2% for visibility
                 ></div>
              </div>
              
              {/* Date Label */}
              <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                {week.displayDate}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};