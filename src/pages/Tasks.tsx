import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Clock, Trash2, Bell, RotateCcw } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RoutineTab: React.FC = () => {
  const { routineItems, addRoutineItem, deleteRoutineItem, toggleRoutineItem } = useSara();
  const [isOpen, setIsOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', time: '08:00' });
  const [now, setNow] = useState(new Date());

  // Update current time every minute
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

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Suas tarefas diárias se renovam automaticamente a cada dia.</p>

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
              className={`sara-card flex items-center gap-3 ${completed ? 'opacity-60' : ''} ${overdue ? 'border-2 border-destructive bg-destructive/5' : ''}`}
            >
              <button
                onClick={() => toggleRoutineItem(item.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  completed
                    ? 'bg-primary border-primary'
                    : overdue
                    ? 'border-destructive'
                    : 'border-primary'
                }`}
              >
                {completed && <Check className="w-4 h-4 text-primary-foreground" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${completed ? 'line-through text-muted-foreground' : overdue ? 'text-destructive' : 'text-foreground'}`}>
                  {item.title}
                </p>
                <span className={`flex items-center gap-1 text-xs ${overdue && !completed ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  <Clock className="w-3 h-3" />
                  {item.time}
                  {overdue && !completed && ' — atrasada!'}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteRoutineItem(item.id)}
                className="text-muted-foreground hover:text-destructive flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {sortedItems.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <RotateCcw className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground">Nenhuma tarefa na rotina</p>
          <p className="text-xs text-muted-foreground">Adicione tarefas que se repetem todo dia</p>
        </motion.div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-sara rounded-2xl shadow-glow flex items-center justify-center z-30"
          >
            <Plus className="w-6 h-6 text-primary-foreground" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Tarefa da Rotina</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="routine-title">O que fazer?</Label>
              <Input
                id="routine-title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Ex: Tomar remédio, Meditar..."
                className="sara-input"
              />
            </div>
            <div>
              <Label htmlFor="routine-time">Horário</Label>
              <Input
                id="routine-time"
                type="time"
                value={newItem.time}
                onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                className="sara-input"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-sara hover:opacity-90">
              Adicionar à Rotina
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

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
    addReminder({
      ...newReminder,
      date: newReminder.date || undefined,
      time: newReminder.time || undefined,
      completed: false,
    });
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
      <p className="text-sm text-muted-foreground">Lembretes avulsos para não esquecer de nada.</p>

      <AnimatePresence mode="popLayout">
        {activeReminders.map((reminder) => {
          const overdue = isOverdue(reminder);
          return (
            <motion.div
              key={reminder.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`sara-card flex items-start gap-3 ${overdue ? 'border-2 border-destructive bg-destructive/5' : ''}`}
            >
              <button
                onClick={() => toggleReminder(reminder.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${overdue ? 'border-destructive' : 'border-sara-gold'}`}
              >
                {reminder.completed && <Check className="w-4 h-4 text-primary-foreground" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${overdue ? 'text-destructive' : 'text-foreground'}`}>{reminder.title}</p>
                {reminder.description && (
                  <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                )}
                {(reminder.date || reminder.time) && (
                  <span className={`flex items-center gap-1 text-xs mt-1 ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    <Clock className="w-3 h-3" />
                    {reminder.date && new Date(reminder.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    {reminder.date && reminder.time && ' · '}
                    {reminder.time}
                    {overdue && ' — atrasado!'}
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteReminder(reminder.id)}
                className="text-muted-foreground hover:text-destructive flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {doneReminders.length > 0 && (
        <div className="pt-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Concluídos</p>
          {doneReminders.map((reminder) => (
            <motion.div
              key={reminder.id}
              className="sara-card flex items-start gap-3 opacity-50 mb-2"
            >
              <button
                onClick={() => toggleReminder(reminder.id)}
                className="w-6 h-6 rounded-lg border-2 bg-primary border-primary flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <Check className="w-4 h-4 text-primary-foreground" />
              </button>
              <p className="font-semibold text-muted-foreground line-through flex-1">{reminder.title}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteReminder(reminder.id)}
                className="text-muted-foreground hover:text-destructive flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {reminders.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Bell className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground">Nenhum lembrete</p>
          <p className="text-xs text-muted-foreground">Ex: Pegar pertences antes de sair</p>
        </motion.div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-sara rounded-2xl shadow-glow flex items-center justify-center z-30"
          >
            <Plus className="w-6 h-6 text-primary-foreground" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Lembrete</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reminder-title">Lembrete</Label>
              <Input
                id="reminder-title"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                placeholder="Ex: Pegar chaves antes de sair"
                className="sara-input"
              />
            </div>
            <div>
              <Label htmlFor="reminder-desc">Detalhes (opcional)</Label>
              <Input
                id="reminder-desc"
                value={newReminder.description}
                onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                placeholder="Adicione mais contexto..."
                className="sara-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="reminder-date">Data (opcional)</Label>
                <Input
                  id="reminder-date"
                  type="date"
                  value={newReminder.date}
                  onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                  className="sara-input"
                />
              </div>
              <div>
                <Label htmlFor="reminder-time">Horário (opcional)</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  className="sara-input"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-sara hover:opacity-90">
              Adicionar Lembrete
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const Tasks: React.FC = () => {
  return (
    <div className="py-4">
      <Tabs defaultValue="rotina" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="rotina" className="flex-1 gap-1">
            <RotateCcw className="w-4 h-4" />
            Rotina
          </TabsTrigger>
          <TabsTrigger value="lembretes" className="flex-1 gap-1">
            <Bell className="w-4 h-4" />
            Lembretes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="rotina">
          <RoutineTab />
        </TabsContent>
        <TabsContent value="lembretes">
          <RemindersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
