import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getDailyCompletionData, getCompletionRate } from '@/lib/store';
import { DAY_SHORT } from '@/lib/types';

type Range = 'week' | 'month';

export default function AnalysisPage() {
  const [range, setRange] = useState<Range>('week');
  const today = new Date();

  const days = range === 'week' ? 7 : 30;
  const data = useMemo(() => getDailyCompletionData(today, days), [range]);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(today);
  monthStart.setDate(monthStart.getDate() - 29);

  const currentRate = range === 'week'
    ? getCompletionRate(weekStart, today)
    : getCompletionRate(monthStart, today);

  const prevEnd = new Date(range === 'week' ? weekStart : monthStart);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days + 1);
  const prevRate = getCompletionRate(prevStart, prevEnd);
  const rateDiff = currentRate - prevRate;

  const maxTotal = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="min-h-screen pb-28">
      <div className="safe-top px-6 pt-4 pb-3">
        <h1 className="text-display">Analysis</h1>
        <p className="text-caption mt-1">Track your consistency over time.</p>
      </div>

      {/* Range toggle */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 p-1 rounded-xl bg-secondary">
          {(['week', 'month'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
                range === r ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Big number */}
      <div className="px-6 mb-8">
        <motion.div
          key={range}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface p-6 text-center"
        >
          <p className="text-[56px] font-bold tracking-tighter tabular text-primary leading-none">
            {currentRate}%
          </p>
          <p className="text-caption mt-2">
            completion this {range}
            {rateDiff !== 0 && (
              <span className={rateDiff > 0 ? ' text-primary' : ' text-warning'}>
                {' '}{rateDiff > 0 ? '+' : ''}{rateDiff}% from last {range}
              </span>
            )}
          </p>
        </motion.div>
      </div>

      {/* Bar chart */}
      <div className="px-6 mb-8">
        <p className="text-section text-muted-foreground mb-4">DAILY BREAKDOWN</p>
        <div className="card-surface p-5">
          <div className="flex items-end gap-1.5" style={{ height: 140 }}>
            {data.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative" style={{ height: 100 }}>
                  {/* Total bar */}
                  <div
                    className="absolute bottom-0 w-full rounded-t bg-secondary"
                    style={{ height: `${(d.total / maxTotal) * 100}%` }}
                  />
                  {/* Completed bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.completed / maxTotal) * 100}%` }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                    className="absolute bottom-0 w-full rounded-t bg-primary"
                  />
                </div>
                {(range === 'week' || i % 5 === 0 || i === data.length - 1) && (
                  <span className="text-[10px] text-muted-foreground tabular">
                    {range === 'week' ? d.day : d.date.slice(5)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 grid grid-cols-2 gap-3">
        <div className="card-surface p-4">
          <p className="text-[28px] font-bold tracking-tighter tabular text-foreground">
            {data.reduce((s, d) => s + d.completed, 0)}
          </p>
          <p className="text-caption mt-1">Tasks completed</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-[28px] font-bold tracking-tighter tabular text-foreground">
            {data.reduce((s, d) => s + d.total - d.completed, 0)}
          </p>
          <p className="text-caption mt-1">Tasks missed</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-[28px] font-bold tracking-tighter tabular text-foreground">
            {data.filter(d => d.rate === 100).length}
          </p>
          <p className="text-caption mt-1">Perfect days</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-[28px] font-bold tracking-tighter tabular text-foreground tabular">
            {Math.max(...data.map(d => d.rate))}%
          </p>
          <p className="text-caption mt-1">Best day</p>
        </div>
      </div>
    </div>
  );
}
