
import React, { useState, useEffect } from 'react';
import { GoalSection } from './components/GoalSection';
import { Heatmap } from './components/Heatmap';
import { AddEntry } from './components/AddEntry';
import { HistoryList } from './components/HistoryList';
import { StatsOverview } from './components/StatsOverview';
import { Typewriter } from './components/Typewriter';
import { FadeIn } from './components/FadeIn';
import { RevenueEntry } from './types';
import { Activity, Download } from 'lucide-react';

const STORAGE_KEY = 'revenue_tracker_data_v1';

const App: React.FC = () => {
  // State initialization with local storage check
  const [targetAmount, setTargetAmount] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).targetAmount : 100000;
  });
  
  // New State for Target Date
  const [targetDate, setTargetDate] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && JSON.parse(saved).targetDate ? JSON.parse(saved).targetDate : '2026-12-30';
  });

  const [entries, setEntries] = useState<RevenueEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).entries : [];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ targetAmount, entries, targetDate }));
  }, [targetAmount, entries, targetDate]);

  const currentTotal = entries.reduce((sum, entry) => sum + entry.amount, 0);

  const handleAddEntry = (newEntry: Omit<RevenueEntry, 'id'>) => {
    const entry: RevenueEntry = {
      ...newEntry,
      id: crypto.randomUUID(),
    };
    setEntries(prev => [...prev, entry]);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Note'];
    const csvContent = [
      headers.join(','),
      ...entries.map(e => {
        const type = e.amount >= 0 ? 'Income' : 'Loss';
        return `${e.date},${type},${e.amount},"${e.note || ''}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `revenue_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Background Image - 3D Coin/Bag style
  const bgDecorationImage = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Money%20Bag.png";

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-20 selection:bg-blue-500/20 font-sans relative overflow-x-hidden">
      
      {/* Background Decorative Layer with Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
           {/* Left Cluster */}
           <img 
              src={bgDecorationImage} 
              alt="decoration"
              className="absolute bottom-[-20px] left-[-40px] w-64 opacity-[0.15] -rotate-12 blur-[2px] animate-float" 
           />
           <img 
              src={bgDecorationImage} 
              alt="decoration"
              className="absolute bottom-[180px] left-[40px] w-32 opacity-[0.08] rotate-12 blur-[4px] animate-float" 
              style={{ animationDelay: '1s' }}
           />
           
           {/* Right Cluster */}
           <img 
              src={bgDecorationImage} 
              alt="decoration"
              className="absolute bottom-[-40px] right-[-20px] w-80 opacity-[0.15] rotate-[15deg] blur-[1px] animate-float-reverse" 
           />
           <img 
              src={bgDecorationImage} 
              alt="decoration"
              className="absolute bottom-[240px] right-[60px] w-24 opacity-[0.08] -rotate-[25deg] blur-[3px] animate-float-reverse"
              style={{ animationDelay: '1.5s' }}
           />
           <img 
              src={bgDecorationImage} 
              alt="decoration"
              className="absolute bottom-[80px] right-[200px] w-20 opacity-[0.05] rotate-[45deg] blur-[2px] animate-float"
              style={{ animationDelay: '0.5s' }}
           />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-black text-white p-1.5 rounded-lg">
                    <Activity className="w-5 h-5" />
                </div>
                <span className="font-semibold text-xl tracking-tight text-gray-900">收益<span className="text-gray-500 font-normal">记录器</span></span>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-4">
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-black hover:bg-black/5 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">导出数据</span>
                </button>
                <div className="text-xs text-gray-400 font-medium hidden sm:block">
                    v1.8 Dashboard
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-8 space-y-6 relative">
        
        {/* Hero Slogan - Typewriter Effect */}
        <div className="text-center min-h-[1.3em]">
            <Typewriter 
                text="记录你的每一份主动收入"
                className="text-[60px] md:text-[84px] font-bold text-[#007acc] leading-snug tracking-tight drop-shadow-md"
                speed={150}
                delay={200}
            />
        </div>

        {/* Top Section: Goal */}
        <FadeIn delay={400}>
            <section>
                <GoalSection 
                    currentAmount={currentTotal} 
                    targetAmount={targetAmount} 
                    onUpdateTarget={setTargetAmount} 
                />
            </section>
        </FadeIn>

        {/* Dashboard Stats */}
        <FadeIn delay={600}>
            <section>
                <StatsOverview 
                    entries={entries} 
                    targetAmount={targetAmount}
                    targetDate={targetDate}
                    onUpdateTargetDate={setTargetDate}
                />
            </section>
        </FadeIn>

        {/* Chart Section */}
        <FadeIn delay={800}>
            <section className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50">
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">累计收益趋势 (Cumulative Revenue)</h2>
                </div>
                <Heatmap entries={entries} />
            </section>
        </FadeIn>

        {/* Action & Data Section */}
        <FadeIn delay={1000}>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Left Col: Input */}
                <div className="xl:col-span-4">
                    <AddEntry onAdd={handleAddEntry} />
                </div>

                {/* Right Col: Table */}
                <div className="xl:col-span-8 h-full min-h-[500px]">
                    <HistoryList entries={entries} onDelete={handleDeleteEntry} />
                </div>
            </div>
        </FadeIn>
      </main>
    </div>
  );
};

export default App;
