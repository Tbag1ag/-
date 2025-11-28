
import React, { useState, useMemo } from 'react';
import { Plus, Calendar, FileText, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { RevenueEntry } from '../types';

interface AddEntryProps {
  onAdd: (entry: Omit<RevenueEntry, 'id'>) => void;
}

export const AddEntry: React.FC<AddEntryProps> = ({ onAdd }) => {
  // Generate list of weekly dates from 2025-11-09 to 2027-01-03
  const sundayOptions = useMemo(() => {
    const dates: string[] = [];
    const toLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Range Start: 2025-11-09 (Sunday)
    const current = new Date('2025-11-09T00:00:00');
    
    const end = new Date('2027-01-03T23:59:59');

    while (current <= end) {
        dates.push(toLocalDateString(current));
        current.setDate(current.getDate() + 7);
    }
    
    // Ascending Order (Oldest to Newest)
    return dates;
  }, []);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'loss'>('income');
  
  const [date, setDate] = useState(() => {
    // Default to the first available date
    return sundayOptions[0];
  });
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const numericAmount = parseFloat(amount);
    const finalAmount = type === 'loss' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

    onAdd({
      amount: finalAmount,
      date,
      note,
    });

    setAmount('');
    setNote('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full sticky top-24">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <div className="bg-black text-white p-1 rounded-md">
            <Plus className="w-4 h-4" />
        </div>
        记录交易
      </h3>
      
      <div className="space-y-5">
        
        {/* Type Selector */}
        <div className="grid grid-cols-2 gap-3 mb-2">
            <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border ${
                    type === 'income' 
                    ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' 
                    : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                }`}
            >
                <ArrowUpCircle className="w-4 h-4" />
                收益 (Income)
            </button>
            <button
                type="button"
                onClick={() => setType('loss')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border ${
                    type === 'loss' 
                    ? 'bg-red-50 border-red-200 text-red-700 shadow-sm' 
                    : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                }`}
            >
                <ArrowDownCircle className="w-4 h-4" />
                亏损 (Loss)
            </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">金额 (Amount)</label>
          <div className="relative group">
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors flex items-center justify-center font-bold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                ¥
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">日期</label>
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors pointer-events-none" />
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none font-medium cursor-pointer"
              required
            >
                {sundayOptions.map(d => (
                    <option key={d} value={d}>{d}</option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">备注 (Note)</label>
          <div className="relative group">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={type === 'income' ? "例如：本周收益..." : "例如：设备维护支出..."}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-black/10 active:scale-[0.98] transition-all mt-4"
        >
          {type === 'income' ? '添加收益记录' : '添加亏损记录'}
        </button>
      </div>
    </form>
  );
};
