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
  Sparkles,
  Eye,
  EyeOff,
  Mic,
  ArrowRight,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

const todayLabel = () =>
  new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: d } }),
};

// ─── Quick Action Card ────────────────────────────────────────────────────────

type QAProps = {
  icon: React.ElementType;
  label: string;
  bg: string;
  iconBg: string;
  iconColor: string;
  onClick: () => void;
};

const QuickAction: React.FC<QAProps> = ({ icon: Icon, label, bg, iconBg, iconColor, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.03, y: -2 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`${bg} p-5 rounded-2xl flex flex-col items-center justify-center gap-3
                border border-white/60 shadow-sm transition-all`}
  >
    <div className={`${iconBg} p-3 rounded-full`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <span className="text-[#1E2A2A] font-semibold text-sm">{label}</span>
  </motion.button>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, transactions, events, user } = useSara();
  const { user: authUser } = useAuth();
  const [showBalance, setShowBalance] = useState(false);

  const firstName = authUser?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.name?.split(' ')[0]
    ?? 'Você';

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === today);
  const completedToday = todayTasks.filter(t => t.completed).length;
  const pendingTasks = todayTasks.filter(t => !t.completed).slice(0, 3);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const positive = balance >= 0;

  const nextEvent = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const minutesUntil = nextEvent
    ? Math.round((new Date(nextEvent.date).getTime() - Date.now()) / 60000)
    : null;

  const progress = todayTasks.length > 0
    ? Math.round((completedToday / todayTasks.length) * 100)
    : 0;

  return (
    <div className="py-4 space-y-6 pb-8">

      {/* ── Greeting ─────────────────────────────────────────────── */}
      <motion.section
        variants={fadeUp} initial="hidden" animate="visible"
        className="px-1"
      >
        <h1 className="text-[#1E2A2A] text-3xl font-extrabold tracking-tight">
          {greeting()}, {firstName}! 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1 capitalize">{todayLabel()}</p>
      </motion.section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <motion.section
        variants={fadeUp} initial="hidden" animate="visible" custom={0.05}
        className="grid grid-cols-2 gap-4"
      >
        {/* Tasks card */}
        <div className="bg-[#E8F5F2] p-5 rounded-2xl flex flex-col gap-2 border border-[#3D7A6F]/10
                        shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#3D7A6F]" />
            <span className="text-[#3D7A6F] text-xs font-bold uppercase tracking-wide">Tarefas Hoje</span>
          </div>
          <p className="text-[#1E2A2A] text-3xl font-extrabold">
            {completedToday}<span className="text-slate-300 font-normal text-lg">/{todayTasks.length}</span>
          </p>
          {/* Progress bar */}
          <div className="h-1.5 bg-white/70 rounded-full overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-[#3D7A6F] rounded-full"
            />
          </div>
          <p className="text-xs text-slate-400">{progress}% concluídas</p>
        </div>

        {/* Balance card */}
        <div className={`p-5 rounded-2xl flex flex-col gap-2 border shadow-sm
          ${positive ? 'bg-white border-slate-100' : 'bg-[#E8725A]/5 border-[#E8725A]/15'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {positive
                ? <TrendingUp className="w-4 h-4 text-[#3D7A6F]" />
                : <TrendingDown className="w-4 h-4 text-[#E8725A]" />}
              <span className={`text-xs font-bold uppercase tracking-wide
                ${positive ? 'text-[#3D7A6F]' : 'text-[#E8725A]'}`}>Saldo</span>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {showBalance
                ? <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </div>
          <p className={`text-[#1E2A2A] text-2xl font-extrabold transition-all duration-300
            ${!showBalance ? 'blur-sm select-none' : ''}`}>
            R$ {Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400">este mês</p>
        </div>
      </motion.section>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <motion.section
        variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
      >
        <h2 className="text-[#1E2A2A] font-bold text-base mb-3">Acesso Rápido</h2>
        <div className="grid grid-cols-2 gap-4">
          <QuickAction
            icon={CheckSquare} label="Rotina"
            bg="bg-[#E8F5F2]" iconBg="bg-white" iconColor="text-[#3D7A6F]"
            onClick={() => navigate('/tasks')}
          />
          <QuickAction
            icon={Calendar} label="Agenda"
            bg="bg-[#FEF3EE]" iconBg="bg-white" iconColor="text-[#E8725A]"
            onClick={() => navigate('/calendar')}
          />
          <QuickAction
            icon={StickyNote} label="Notas"
            bg="bg-[#EEF3FE]" iconBg="bg-white" iconColor="text-[#5B7BE8]"
            onClick={() => navigate('/notes')}
          />
          <QuickAction
            icon={Brain} label="Ideias"
            bg="bg-[#FEFBEE]" iconBg="bg-white" iconColor="text-[#E8B725]"
            onClick={() => navigate('/mindmap')}
          />
        </div>
      </motion.section>

      {/* ── Next Event ───────────────────────────────────────────── */}
      {nextEvent && (
        <motion.section
          variants={fadeUp} initial="hidden" animate="visible" custom={0.15}
        >
          <h2 className="text-[#1E2A2A] font-bold text-base mb-3">Próximo Compromisso</h2>
          <button
            onClick={() => navigate('/calendar')}
            className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm
                       flex items-center gap-4 text-left hover:shadow-md transition-shadow group"
          >
            <div className="w-1 h-12 bg-[#3D7A6F] rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#1E2A2A] truncate">{nextEvent.title}</p>
              <p className="text-sm text-slate-400">
                {new Date(nextEvent.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                {nextEvent.location ? ` · ${nextEvent.location}` : ''}
              </p>
            </div>
            {minutesUntil !== null && minutesUntil <= 60 && minutesUntil > 0 && (
              <span className="bg-[#E8F5F2] text-[#3D7A6F] text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                Em {minutesUntil}min
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#3D7A6F] transition-colors" />
          </button>
        </motion.section>
      )}

      {/* ── Pending Tasks ─────────────────────────────────────────── */}
      {pendingTasks.length > 0 && (
        <motion.section
          variants={fadeUp} initial="hidden" animate="visible" custom={0.2}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#1E2A2A] font-bold text-base">Pendências</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}
              className="text-[#3D7A6F] hover:text-[#3D7A6F] hover:bg-[#E8F5F2] text-xs h-7 px-3">
              Ver todas
            </Button>
          </div>
          <div className="space-y-2">
            {pendingTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center gap-3"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-[#E8725A]' :
                    task.priority === 'medium' ? 'bg-[#E8B725]' : 'bg-[#3D7A6F]'
                  }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1E2A2A] text-sm truncate">{task.title}</p>
                  {task.time && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />{task.time}
                  </p>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.priority === 'high' ? 'bg-[#E8725A]/10 text-[#E8725A]' :
                    task.priority === 'medium' ? 'bg-[#E8B725]/10 text-[#E8B725]' :
                      'bg-[#3D7A6F]/10 text-[#3D7A6F]'
                  }`}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Sara CTA ─────────────────────────────────────────────── */}
      <motion.section
        variants={fadeUp} initial="hidden" animate="visible" custom={0.25}
      >
        <button
          onClick={() => navigate('/sara')}
          className="w-full bg-gradient-to-br from-[#3D7A6F] to-[#4a9088] p-5 rounded-2xl
                     flex items-center gap-4 group hover:brightness-110 transition-all
                     shadow-[0_8px_32px_rgba(62,122,111,0.3)] hover:shadow-[0_12px_40px_rgba(62,122,111,0.4)]"
        >
          <div className="w-14 h-14 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-extrabold text-white text-lg">Fale com a Sara</p>
            <p className="text-sm text-white/80">Sua assistente pessoal para TDAH</p>
          </div>
          <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.section>

      {/* ── Floating Mic ─────────────────────────────────────────── */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/sara?mic=true')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#E8725A] rounded-full
                   shadow-[0_8px_24px_rgba(232,114,90,0.5)] flex items-center justify-center z-40
                   hover:brightness-110 transition-all"
        aria-label="Falar com a Sara"
      >
        <Mic className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
};

export default Dashboard;
