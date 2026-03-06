import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  Wallet, 
  MessageCircle,
  StickyNote,
  Brain,
  BookHeart,
  MoreHorizontal,
  X
} from 'lucide-react';

const mainItems = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/tasks', icon: CheckSquare, label: 'Rotina' },
  { path: '/calendar', icon: Calendar, label: 'Agenda' },
  { path: '/finances', icon: Wallet, label: 'Finanças' },
];

const moreItems = [
  { path: '/sara', icon: MessageCircle, label: 'Sara' },
  { path: '/notes', icon: StickyNote, label: 'Notas' },
  { path: '/diary', icon: BookHeart, label: 'Diário' },
  { path: '/mindmap', icon: Brain, label: 'Mapa Mental' },
];

export const BottomNav: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const isMoreActive = moreItems.some(item => item.path === location.pathname);

  return (
    <>
      {/* More menu overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowMore(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 right-2 left-2 bg-card rounded-2xl shadow-xl border border-border z-50 p-3"
          >
            <div className="grid grid-cols-4 gap-2">
              {moreItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMore(false)}
                  className={({ isActive }) => `
                    flex flex-col items-center gap-1 p-3 rounded-xl transition-colors
                    ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {mainItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                sara-nav-item flex-1 relative
                ${isActive ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 relative z-10 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-xs font-medium relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`sara-nav-item flex-1 relative ${isMoreActive || showMore ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {(isMoreActive && !showMore) && (
              <motion.div
                layoutId="navIndicator"
                className="absolute inset-0 bg-primary/10 rounded-xl"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {showMore ? (
              <X className="w-5 h-5 relative z-10" />
            ) : (
              <MoreHorizontal className="w-5 h-5 relative z-10" />
            )}
            <span className="text-xs font-medium relative z-10">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
};
