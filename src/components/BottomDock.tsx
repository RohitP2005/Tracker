import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, BarChart3, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', icon: Sun, label: 'Today' },
  { path: '/plan', icon: CalendarDays, label: 'Plan' },
  { path: '/analysis', icon: BarChart3, label: 'Analysis' },
];

export default function BottomDock() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-4 mb-2 flex items-center justify-around rounded-2xl card-surface py-2 px-4 backdrop-blur-xl">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-1 px-6 py-2"
            >
              {active && (
                <motion.div
                  layoutId="dock-indicator"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <tab.icon
                className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[11px] relative z-10 transition-colors duration-200 ${
                  active ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
