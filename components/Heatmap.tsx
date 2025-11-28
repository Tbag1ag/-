
import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { RevenueEntry } from '../types';

interface HeatmapProps {
  entries: RevenueEntry[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ entries }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 350 });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: 350
            });
        }
    };
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prepare Data: Group by Weekly Sunday and Calculate Cumulative Sum
  const data = useMemo(() => {
    const map = new Map<string, number>();

    // Helper to get YYYY-MM-DD from Date object using Local time
    const toLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    entries.forEach(e => {
        // e.date is "YYYY-MM-DD" from AddEntry.tsx
        // Create date object treating the string as Local Time
        const d = new Date(e.date + 'T00:00:00'); 
        
        // Ensure we snap to Sunday
        const day = d.getDay();
        // If it's not Sunday (0), move to next Sunday
        const diff = day === 0 ? 0 : 7 - day;
        d.setDate(d.getDate() + diff);
        
        const key = toLocalDateString(d);
        map.set(key, (map.get(key) || 0) + e.amount);
    });

    if (map.size === 0) return [];

    const dates = Array.from(map.keys()).sort();
    
    // Create a continuous timeline
    const minDate = new Date(dates[0] + 'T00:00:00');
    const maxDate = new Date(); 
    // Set maxDate to today + padding if needed, or at least the last entry
    const lastEntryDate = new Date(dates[dates.length - 1] + 'T00:00:00');
    if (lastEntryDate > maxDate) {
        maxDate.setTime(lastEntryDate.getTime());
    }

    // Adjust maxDate to next Sunday
    const eDay = maxDate.getDay();
    maxDate.setDate(maxDate.getDate() + (eDay === 0 ? 0 : 7 - eDay));
    
    // Ensure we show at least 10 weeks of history
    const tenWeeksAgo = new Date(maxDate);
    tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70);
    
    let current = minDate < tenWeeksAgo ? minDate : tenWeeksAgo;
    
    // Align current start to Sunday
    const sDay = current.getDay();
    current.setDate(current.getDate() + (sDay === 0 ? 0 : 7 - sDay));

    const points: { date: Date; value: number }[] = [];
    let cumulativeTotal = 0;

    // Iterate through weeks to build cumulative data
    // Important: We must start calculating cumulative sum from the very beginning of data (minDate)
    // even if we only display from 'current' (tenWeeksAgo).
    // However, the current logic sets 'current' to the start of the visible range. 
    // If 'minDate' < 'current', we miss the initial accumulation.
    
    // Correct approach: Iterate from minDate to maxDate.
    // Use a temporary cursor for calculation.
    let calcCursor = new Date(minDate);
    // Align calcCursor to Sunday
    const calcDay = calcCursor.getDay();
    calcCursor.setDate(calcCursor.getDate() + (calcDay === 0 ? 0 : 7 - calcDay));

    while (calcCursor <= maxDate) {
        const key = toLocalDateString(calcCursor);
        const weeklyAmount = map.get(key) || 0;
        cumulativeTotal += weeklyAmount;

        // Only push points if they are within our desired display range (current -> maxDate)
        if (calcCursor >= current) {
             points.push({
                date: new Date(calcCursor), // Clone
                value: cumulativeTotal
            });
        }
       
        calcCursor.setDate(calcCursor.getDate() + 7);
    }
    
    return points;
  }, [entries]);

  // D3 Rendering Logic
  const svgContent = useMemo(() => {
    if (dimensions.width === 0 || data.length === 0) return null;

    const margin = { top: 20, right: 20, bottom: 30, left: 50 }; // Increased left margin for larger numbers
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date) as [Date, Date])
        .range([0, width]);

    const minVal = d3.min(data, d => d.value) || 0;
    const maxVal = d3.max(data, d => d.value) || 100;

    const y = d3.scaleLinear()
        .domain([Math.min(0, minVal), maxVal * 1.05]) // Handle potential negative starts, add 5% headroom
        .nice()
        .range([height, 0]);

    // Area Generator
    const area = d3.area<{ date: Date; value: number }>()
        .curve(d3.curveCatmullRom.alpha(0.5)) // Smooth curve
        .x(d => x(d.date))
        .y0(height)
        .y1(d => y(d.value));

    // Line Generator
    const line = d3.line<{ date: Date; value: number }>()
        .curve(d3.curveCatmullRom.alpha(0.5))
        .x(d => x(d.date))
        .y(d => y(d.value));

    const dPath = area(data) || '';
    const lPath = line(data) || '';

    // X Axis Ticks
    const xTicks = x.ticks(Math.max(width / 80, 2)).map(tick => ({
        x: x(tick),
        label: d3.timeFormat("%m/%d")(tick)
    }));

    // Y Axis Ticks
    const yTicks = y.ticks(5).map(tick => ({
        y: y(tick),
        label: tick
    }));

    // Points for interaction
    const pointsRender = data.map((d, i) => {
        // Format tooltip date
        const year = d.date.getFullYear();
        const month = String(d.date.getMonth() + 1).padStart(2, '0');
        const day = String(d.date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        return {
            x: x(d.date),
            y: y(d.value),
            value: d.value,
            date: dateStr
        };
    });

    return (
        <svg width={dimensions.width} height={dimensions.height} className="overflow-visible font-sans">
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#111827" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#111827" stopOpacity="0.0" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                   <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.1)" />
                </filter>
            </defs>
            
            <g transform={`translate(${margin.left},${margin.top})`}>
                {/* Grid Lines */}
                {yTicks.map((tick, i) => (
                    <g key={i} transform={`translate(0,${tick.y})`}>
                        <line x1="0" x2={width} stroke="#f3f4f6" strokeWidth="1" />
                        <text x="-10" y="4" textAnchor="end" className="text-[10px] fill-gray-400 font-medium">
                           {tick.label >= 1000 ? (tick.label/1000).toFixed(1) + 'k' : tick.label}
                        </text>
                    </g>
                ))}

                {/* X Axis */}
                {xTicks.map((tick, i) => (
                    <g key={i} transform={`translate(${tick.x},${height + 20})`}>
                        <text textAnchor="middle" className="text-[10px] fill-gray-400 font-medium">
                            {tick.label}
                        </text>
                    </g>
                ))}

                {/* Chart Paths with Animation */}
                <path d={dPath} fill="url(#chartGradient)" />
                <path 
                    d={lPath} 
                    fill="none" 
                    stroke="#111827" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    filter="url(#shadow)"
                />

                {/* Interactive Points */}
                {pointsRender.map((p, i) => (
                    <g key={i} className="group">
                        <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="6" 
                            className="fill-white stroke-black stroke-[3px] opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg" 
                        />
                        <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="20" 
                            className="fill-transparent cursor-pointer" 
                        />
                        {/* Tooltip */}
                        <foreignObject 
                            x={Math.min(Math.max(p.x - 75, 0), width - 150)} 
                            y={p.y - 60} 
                            width="150" 
                            height="60" 
                            className="opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50"
                        >
                            <div className="bg-black text-white text-xs rounded-xl py-2 px-3 text-center shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                <div className="text-gray-400 text-[10px] mb-0.5">{p.date}</div>
                                <div className="font-bold text-sm">累计: ¥{p.value.toLocaleString()}</div>
                            </div>
                        </foreignObject>
                    </g>
                ))}
            </g>
        </svg>
    );
  }, [dimensions, data]);

  return (
    <div ref={containerRef} className="w-full h-[350px]">
        {data.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                </div>
                <span className="text-sm font-medium">添加第一笔记录以查看趋势</span>
             </div>
        ) : (
            svgContent
        )}
    </div>
  );
};
