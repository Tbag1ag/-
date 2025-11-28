import React from 'react';
import { RevenueEntry } from '../types';
import { Trash2, TrendingUp, MoreHorizontal } from 'lucide-react';

interface HistoryListProps {
  entries: RevenueEntry[];
  onDelete: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ entries, onDelete }) => {
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
            <TrendingUp className="w-6 h-6 text-gray-300" />
        </div>
        <p className="font-medium">暂无记录，开始您的第一笔交易吧！</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-gray-900 text-lg">近期记录</h3>
            <div className="flex items-center gap-2">
                 <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Last {entries.length}</span>
                 <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                 </button>
            </div>
        </div>
        
        <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="py-4 pl-6 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[120px]">Date</th>
                        <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</th>
                        <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[100px]">State</th>
                        <th className="py-4 pl-4 pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right w-[120px]">Amount</th>
                        <th className="w-[50px]"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {sorted.map((entry) => {
                        const isProfit = entry.amount >= 0;
                        return (
                            <tr key={entry.id} className="group hover:bg-gray-50 transition-colors">
                                <td className="py-4 pl-6 pr-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                    {formatDate(entry.date)}
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-600 font-medium">
                                    <div className="truncate max-w-[150px] sm:max-w-[220px]" title={entry.note}>
                                        {entry.note || "-"}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${
                                        isProfit 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                        {isProfit ? 'Success' : 'Loss'}
                                    </span>
                                </td>
                                <td className={`py-4 pl-4 pr-6 text-sm font-bold text-right ${isProfit ? 'text-gray-900' : 'text-red-600'}`}>
                                    {isProfit ? '+' : ''}¥{Math.abs(entry.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-4 pr-4 text-right">
                                    <button 
                                        onClick={() => onDelete(entry.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );
};