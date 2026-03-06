import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Calendar, 
  Wallet, 
  StickyNote, 
  Brain,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  Mic
} from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';

const QuickAction: React.FC<{
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}> = ({ icon: Icon, label, color, bgColor, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`${bgColor} p-4 rounded-2xl flex flex-col items-center gap-2 shadow-sara transition-all hover:shadow-lg`}
  >
    <div className={`w-12 h-12 ${color} bg-card rounded-xl flex items-center justify-center`}>
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-sm font-semibold text-foreground">{label}</span>
  </motion.button>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, transactions, events } = useSara();
  const [showBalance, setShowBalance] = useState(false);

  const todayTasks = tasks.filter(t => t.date === new Date().toISOString().split('T')[0]);
  const completedToday = todayTasks.filter(t => t.completed).length;
  const pendingTasks = todayTasks.filter(t => !t.completed);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).slice(0, 3);

  return (
    <div className="py-4 space-y-6">
      {/* Quick Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="sara-card bg-sara-teal-light">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Tarefas Hoje</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {completedToday}/{todayTasks.length}
          </p>
          <p className="text-xs text-muted-foreground">concluídas</p>
        </div>

        <div className={`sara-card ${balance >= 0 ? 'bg-sara-mint-light' : 'bg-sara-coral-light'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {balance >= 0 ? (
                <TrendingUp className="w-5 h-5 text-sara-mint" />
              ) : (
                <TrendingDown className="w-5 h-5 text-sara-coral" />
              )}
              <span className="text-sm font-medium text-muted-foreground">Saldo</span>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-lg hover:bg-card/50 transition-colors"
              aria-label={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
            >
              {showBalance ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className={`text-2xl font-bold text-foreground transition-all duration-300 ${!showBalance ? 'blur-md select-none' : ''}`}>
            R$ {balance.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-muted-foreground">este mês</p>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="sara-section-title">Acesso Rápido</h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction
            icon={CheckSquare}
            label="Rotina"
            color="text-primary"
            bgColor="bg-sara-teal-light"
            onClick={() => navigate('/tasks')}
          />
          <QuickAction
            icon={Calendar}
            label="Agenda"
            color="text-sara-coral"
            bgColor="bg-sara-coral-light"
            onClick={() => navigate('/calendar')}
          />
          <QuickAction
            icon={StickyNote}
            label="Notas"
            color="text-sara-lavender"
            bgColor="bg-sara-lavender-light"
            onClick={() => navigate('/notes')}
          />
          <QuickAction
            icon={Brain}
            label="Ideias"
            color="text-sara-gold"
            bgColor="bg-sara-gold-light"
            onClick={() => navigate('/mindmap')}
          />
        </div>
      </motion.section>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="sara-section-title mb-0">Próximas Tarefas</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
              Ver todas
            </Button>
          </div>
          <div className="space-y-3">
            {pendingTasks.slice(0, 3).map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="sara-card flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  task.priority === 'high' ? 'bg-sara-coral-light text-sara-coral' :
                  task.priority === 'medium' ? 'bg-sara-gold-light text-sara-gold' :
                  'bg-sara-teal-light text-primary'
                }`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.time}</p>
                </div>
                <span className={`sara-badge text-xs ${
                  task.priority === 'high' ? 'bg-sara-coral-light text-sara-coral' :
                  task.priority === 'medium' ? 'bg-sara-gold-light text-sara-gold' :
                  'bg-sara-teal-light text-primary'
                }`}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Sara CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => navigate('/sara')}
          className="w-full bg-gradient-sara p-4 rounded-2xl shadow-glow flex items-center gap-4 group"
        >
          <div className="w-14 h-14 bg-card/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary-foreground animate-pulse-soft" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-primary-foreground text-lg">Fale com a Sara</p>
            <p className="text-sm text-primary-foreground/80">
              Sua assistente pessoal para TDAH
            </p>
          </div>
        </button>
      </motion.section>

      {/* Floating Mic Button - Quick voice access */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/sara?mic=true')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-sara rounded-full shadow-glow flex items-center justify-center z-40"
        aria-label="Falar com a Sara por voz"
      >
        <Mic className="w-6 h-6 text-primary-foreground" />
      </motion.button>
    </div>
  );
};

export default Dashboard;
