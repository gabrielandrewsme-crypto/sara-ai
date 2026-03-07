import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { SaraLogo } from '@/components/SaraLogo';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

const pageNames: Record<string, string> = {
  '/dashboard': 'Início',
  '/tasks': 'Rotina',
  '/calendar': 'Agenda',
  '/finances': 'Finanças',
  '/notes': 'Notas',
  '/mindmap': 'Mapa Mental',
  '/settings': 'Configurações',
  '/diary': 'Diário',
};

export const Header: React.FC<HeaderProps> = ({ title, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useSara();

  const currentTitle = title || pageNames[location.pathname] || 'Sara';
  const isHome = location.pathname === '/dashboard';

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="shrink-0">
              <SaraLogo size={40} />
            </div>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold text-foreground"
              >
                {currentTitle}
              </motion.h1>
              {isHome && (
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="rounded-xl"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

    </>
  );
};