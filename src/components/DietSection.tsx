import { motion } from 'framer-motion';
import { DietItem, PERIODS, Period } from '@/lib/types';
import DietCard from './DietCard';
import { isDietCompleted, toggleDietCompletion } from '@/lib/store';
import { useState } from 'react';

interface DietSectionProps {
  period: Period;
  items: DietItem[];
  date: Date;
  isActive: boolean;
  onUpdate: () => void;
}

export default function DietSection({ period, items, date, isActive, onUpdate }: DietSectionProps) {
  const [collapsed, setCollapsed] = useState(!isActive);
  const periodInfo = PERIODS.find(p => p.key === period)!;
  const completedCount = items.filter(i => isDietCompleted(i.id, date)).length;

  if (items.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6">
      <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <span className={`text-section ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
            {periodInfo.label}
          </span>
          <span className="text-caption tabular">{completedCount}/{items.length}</span>
        </div>
        <span className="text-[12px] text-muted-foreground tabular">{periodInfo.timeRange}</span>
      </button>

      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          className="flex flex-col gap-2 pb-4"
        >
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <DietCard
                item={item}
                completed={isDietCompleted(item.id, date)}
                onToggle={() => { toggleDietCompletion(item.id, date); onUpdate(); }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
