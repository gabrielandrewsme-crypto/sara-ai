import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Trash2 } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const EVENT_COLORS = [
  'bg-sara-teal',
  'bg-sara-coral',
  'bg-sara-lavender',
  'bg-sara-mint',
  'bg-sara-gold',
];

export const CalendarPage: React.FC = () => {
  const { events, tasks, addEvent, deleteEvent } = useSara();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    color: EVENT_COLORS[0],
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDate = (date: string) => events.filter(e => e.date === date);
  const getTasksForDate = (date: string) => tasks.filter(t => t.date === date);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    addEvent(newEvent);
    setNewEvent({
      title: '',
      description: '',
      date: selectedDate || new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      color: EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)],
    });
    setIsOpen(false);
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="py-4 space-y-4">
      {/* Calendar Header */}
      <div className="sara-card">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-bold text-foreground">
            {MONTHS[month]} {year}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = getDateString(day);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;
            const dayEvents = getEventsForDate(dateStr);
            const dayTasks = getTasksForDate(dateStr);
            const hasItems = dayEvents.length > 0 || dayTasks.length > 0;

            return (
              <motion.button
                key={day}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : isToday
                    ? 'bg-sara-teal-light text-primary font-bold'
                    : 'hover:bg-secondary'
                }`}
              >
                <span className="text-sm">{day}</span>
                {hasItems && !isSelected && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 2).map((e, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${e.color}`} />
                    ))}
                    {dayTasks.length > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="sara-section-title mb-0">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h3>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {selectedEvents.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="sara-card flex items-start gap-3"
                >
                  <div className={`w-1.5 h-full min-h-[60px] rounded-full ${event.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {event.startTime} - {event.endTime}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEvent(event.id)}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}

              {selectedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="sara-card flex items-center gap-3 opacity-75"
                >
                  <div className="w-1.5 h-12 rounded-full bg-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Tarefa</p>
                    <p className="font-medium text-foreground">{task.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{task.time}</span>
                </motion.div>
              ))}
            </AnimatePresence>

            {selectedEvents.length === 0 && selectedTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum evento ou tarefa para este dia
              </p>
            )}
          </div>
        </motion.section>
      )}

      {/* Add Event FAB */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-coral rounded-2xl shadow-lg flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-accent-foreground" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Nome do evento"
                className="sara-input"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Detalhes do evento..."
                className="sara-input"
              />
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="sara-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startTime">Início</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="sara-input"
                />
              </div>
              <div>
                <Label htmlFor="endTime">Término</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="sara-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Local (opcional)</Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Onde será o evento?"
                className="sara-input"
              />
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex gap-2 mt-2">
                {EVENT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewEvent({ ...newEvent, color })}
                    className={`w-8 h-8 rounded-full ${color} ${
                      newEvent.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-coral hover:opacity-90">
              Adicionar Evento
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
