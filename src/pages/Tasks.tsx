import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Clock, Trash2, Bell, RotateCcw, AlertCircle } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Design tokens ────────────────────────────────────────────────────────────
const PRIMARY = '#5C2D91';
const CORAL = '#E8725A';
const GOLD = '#E8B725';

// ─── Routine Tab ──────────────────────────────────────────────────────────────

const RoutineTab: React.FC = () => {
  const { routineItems, addRoutineItem, deleteRoutineItem, toggleRoutineItem } = useSara();
  const [isOpen, setIsOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', time: '08:00' });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const today = now.toISOString().split('T')[0];
  const isOverdue = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return now.getHours() > h || (now.getHours() === h && now.getMinutes() > m);
  };
  const isCompletedToday = (item: typeof routineItems[0]) => item.lastCompletedDate === today;
  const sortedItems = [...routineItems].sort((a, b) => a.time.localeCompare(b.time));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;
    addRoutineItem({ ...newItem, completed: false });
    setNewItem({ title: '', time: '08:00' });
    setIsOpen(false);
  };

  const completedCount = sortedItems.filter(i => isCompletedToday(i)).length;
  const progress = sortedItems.length > 0 ? Math.round((completedCount / sortedItems.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress bar header */}
      {sortedItems.length > 0 && (
        <div className="bg-[#EDE9FE] rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-semibold text-[#1E2A2A]">Progresso de hoje</span>
              <span className="font-bold text-[#5C2D91]">{completedCount}/{sortedItems.length}</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-[#5C2D91] rounded-full"
              />
            </div>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-extrabold text-[#5C2D91]">{progress}%</span>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400">Tarefas que se renovam automaticamente todo dia.</p>

      <AnimatePresence mode="popLayout">
        {sortedItems.map((item) => {
          const completed = isCompletedToday(item);
          const overdue = !completed && isOverdue(item.time);

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`bg-white rounded-2xl p-4 flex items-center gap-3 border transition-all
                ${completed ? 'opacity-60 border-slate-100' : overdue ? 'border-[#E8725A]/40 bg-[#E8725A]/5' : 'border-slate-100 shadow-sm'}`}
            >
              <button
                onClick={() => toggleRoutineItem(item.id)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${completed ? 'bg-[#5C2D91] border-[#5C2D91]'
                    : overdue ? 'border-[#E8725A]'
                      : 'border-slate-300 hover:border-[#5C2D91]'
                  }`}
              >
                {completed && <Check className="w-3.5 h-3.5 text-white" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${completed ? 'line-through text-slate-400' : overdue ? 'text-[#E8725A]' : 'text-[#1E2A2A]'}`}>
                  {item.title}
                </p>
                <span className={`flex items-center gap-1 text-xs mt-0.5 ${overdue && !completed ? 'text-[#E8725A] font-medium' : 'text-slate-400'}`}>
                  <Clock className="w-3 h-3" />
                  {item.time}{overdue && !completed && ' · atrasada!'}
                </span>
              </div>

              {overdue && !completed && <AlertCircle className="w-4 h-4 text-[#E8725A] flex-shrink-0" />}

              <Button variant="ghost" size="icon" onClick={() => deleteRoutineItem(item.id)}
                className="text-slate-300 hover:text-[#E8725A] flex-shrink-0 w-8 h-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {sortedItems.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-16 h-16 bg-[#EDE9FE] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <RotateCcw className="w-8 h-8 text-[#5C2D91]" />
          </div>
          <p className="font-semibold text-[#1E2A2A]">Nenhuma rotina ainda</p>
          <p className="text-xs text-slate-400 mt-1">Adicione tarefas que repetem todo dia</p>
        </motion.div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 w-14 h-14 bg-[#5C2D91] rounded-full
                       shadow-[0_8px_24px_rgba(92,45,145,0.4)] flex items-center justify-center z-30"
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nova Tarefa da Rotina</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="routine-title">O que fazer?</Label>
              <Input id="routine-title" value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Ex: Tomar remédio, Meditar..." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="routine-time">Horário</Label>
              <Input id="routine-time" type="time" value={newItem.time}
                onChange={(e) => setNewItem({ ...newItem, time: e.target.value })} className="mt-1" />
            </div>
            <Button type="submit" className="w-full bg-[#5C2D91] hover:bg-[#5C2D91]/90 text-white">
              Adicionar à Rotina
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Reminders Tab ────────────────────────────────────────────────────────────

const RemindersTab: React.FC = () => {
  const { reminders, addReminder, deleteReminder, toggleReminder } = useSara();
  const [isOpen, setIsOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: '', description: '', date: '', time: '' });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.title.trim()) return;
    addReminder({ ...newReminder, date: newReminder.date || undefined, time: newReminder.time || undefined, completed: false });
    setNewReminder({ title: '', description: '', date: '', time: '' });
    setIsOpen(false);
  };

  const isOverdue = (reminder: typeof reminders[0]) => {
    if (!reminder.date || !reminder.time || reminder.completed) return false;
    const [h, m] = reminder.time.split(':').map(Number);
    const reminderDate = new Date(reminder.date + 'T00:00:00');
    const today = new Date(now.toISOString().split('T')[0] + 'T00:00:00');
    if (reminderDate < today) return true;
    if (reminderDate.getTime() === today.getTime()) {
      return now.getHours() > h || (now.getHours() === h && now.getMinutes() > m);
    }
    return false;
  };

  const activeReminders = reminders.filter(r => !r.completed);
  const doneReminders = reminders.filter(r => r.completed);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Lembretes avulsos para não esquecer de nada.</p>

      <AnimatePresence mode="popLayout">
        {activeReminders.map((reminder) => {
          const overdue = isOverdue(reminder);
          return (
            <motion.div
              key={reminder.id} layout
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`bg-white rounded-2xl p-4 flex items-start gap-3 border
                ${overdue ? 'border-[#E8725A]/40 bg-[#E8725A]/5' : 'border-slate-100 shadow-sm'}`}
            >
              <button
                onClick={() => toggleReminder(reminder.id)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${overdue ? 'border-[#E8725A] hover:bg-[#E8725A] hover:border-[#E8725A]' : 'border-[#E8B725] hover:bg-[#E8B725]/10'
                  }`}
              >
                {reminder.completed && <Check className="w-3.5 h-3.5" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${overdue ? 'text-[#E8725A]' : 'text-[#1E2A2A]'}`}>{reminder.title}</p>
                {reminder.description && <p className="text-xs text-slate-400 mt-0.5">{reminder.description}</p>}
                {(reminder.date || reminder.time) && (
                  <span className={`flex items-center gap-1 text-xs mt-1 ${overdue ? 'text-[#E8725A] font-medium' : 'text-slate-400'}`}>
                    <Clock className="w-3 h-3" />
                    {reminder.date && new Date(reminder.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    {reminder.date && reminder.time && ' · '}
                    {reminder.time}
                    {overdue && ' · atrasado!'}
                  </span>
                )}
              </div>

              <Button variant="ghost" size="icon" onClick={() => deleteReminder(reminder.id)}
                className="text-slate-300 hover:text-[#E8725A] flex-shrink-0 w-8 h-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {doneReminders.length > 0 && (
        <div className="pt-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Concluídos</p>
          {doneReminders.map((reminder) => (
            <motion.div key={reminder.id}
              className="bg-white rounded-2xl p-3.5 flex items-start gap-3 opacity-50 border border-slate-100 mb-2">
              <button onClick={() => toggleReminder(reminder.id)}
                className="w-7 h-7 rounded-full border-2 bg-[#5C2D91] border-[#5C2D91] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-white" />
              </button>
              <p className="font-semibold text-sm text-slate-400 line-through flex-1">{reminder.title}</p>
              <Button variant="ghost" size="icon" onClick={() => deleteReminder(reminder.id)}
                className="text-slate-300 hover:text-[#E8725A] flex-shrink-0 w-8 h-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {reminders.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-16 h-16 bg-[#FEFBEE] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Bell className="w-8 h-8 text-[#E8B725]" />
          </div>
          <p className="font-semibold text-[#1E2A2A]">Nenhum lembrete</p>
          <p className="text-xs text-slate-400 mt-1">Ex: Pagar conta, Pegar pertences</p>
        </motion.div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 w-14 h-14 bg-[#E8B725] rounded-full
                       shadow-[0_8px_24px_rgba(232,183,37,0.4)] flex items-center justify-center z-30"
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo Lembrete</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reminder-title">Lembrete</Label>
              <Input id="reminder-title" value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                placeholder="Ex: Pegar chaves antes de sair" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="reminder-desc">Detalhes (opcional)</Label>
              <Input id="reminder-desc" value={newReminder.description}
                onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                placeholder="Adicione mais contexto..." className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="reminder-date">Data (opcional)</Label>
                <Input id="reminder-date" type="date" value={newReminder.date}
                  onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="reminder-time">Horário (opcional)</Label>
                <Input id="reminder-time" type="time" value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })} className="mt-1" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#E8B725] hover:bg-[#E8B725]/90 text-white">
              Adicionar Lembrete
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const Tasks: React.FC = () => {
  return (
    <div className="py-4">
      <Tabs defaultValue="rotina" className="w-full">
        <TabsList className="w-full mb-5 bg-slate-100 p-1 rounded-2xl h-auto">
          <TabsTrigger value="rotina"
            className="flex-1 gap-1.5 rounded-xl py-2.5 font-semibold text-sm
                       data-[state=active]:bg-white data-[state=active]:text-[#5C2D91] data-[state=active]:shadow-sm">
            <RotateCcw className="w-4 h-4" />
            Rotina
          </TabsTrigger>
          <TabsTrigger value="lembretes"
            className="flex-1 gap-1.5 rounded-xl py-2.5 font-semibold text-sm
                       data-[state=active]:bg-white data-[state=active]:text-[#E8B725] data-[state=active]:shadow-sm">
            <Bell className="w-4 h-4" />
            Lembretes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="rotina"><RoutineTab /></TabsContent>
        <TabsContent value="lembretes"><RemindersTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
