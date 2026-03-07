import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Trash2, CalendarDays } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const EVENT_PALETTES = [
  { bg: 'bg-[#3D7A6F]', light: 'bg-[#E8F5F2]', text: 'text-[#3D7A6F]', dot: '#3D7A6F' },
  { bg: 'bg-[#E8725A]', light: 'bg-[#FEF3EE]', text: 'text-[#E8725A]', dot: '#E8725A' },
  { bg: 'bg-[#5B7BE8]', light: 'bg-[#EEF3FE]', text: 'text-[#5B7BE8]', dot: '#5B7BE8' },
  { bg: 'bg-[#E8B725]', light: 'bg-[#FEFBEE]', text: 'text-[#E8B725]', dot: '#E8B725' },
  { bg: 'bg-[#9B59B6]', light: 'bg-[#F5EEF8]', text: 'text-[#9B59B6]', dot: '#9B59B6' },
];

// Map legacy CSS colors to palette index
const colorToPalette = (color: string) => {
  if (color.includes('coral')) return 1;
  if (color.includes('lavender')) return 2;
  if (color.includes('gold')) return 3;
  if (color.includes('mint') && !color.includes('teal')) return 4;
  return 0;
};

const EVENT_COLORS_LEGACY = [
  'bg-sara-teal', 'bg-sara-coral', 'bg-sara-lavender', 'bg-sara-mint', 'bg-sara-gold',
];

// ─── Component ────────────────────────────────────────────────────────────────
export const CalendarPage: React.FC = () => {
  const { events, tasks, addEvent, deleteEvent } = useSara();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    new Date().toISOString().split('T')[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    color: EVENT_COLORS_LEGACY[0],
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getDateString = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getEventsForDate = (date: string) => events.filter(e => e.date === date);
  const getTasksForDate = (date: string) => tasks.filter(t => t.date === date);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;
    addEvent({ ...newEvent, color: EVENT_COLORS_LEGACY[selectedPalette] });
    setNewEvent({
      title: '', description: '',
      date: selectedDate || today,
      startTime: '09:00', endTime: '10:00', location: '',
      color: EVENT_COLORS_LEGACY[0],
    });
    setSelectedPalette(0);
    setIsOpen(false);
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="py-4 space-y-4">

      {/* ── Calendar Card ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <h2 className="text-base font-extrabold text-[#1E2A2A]">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) return <div key={`e-${index}`} className="aspect-square" />;

            const dateStr = getDateString(day);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const dayEvents = getEventsForDate(dateStr);
            const dayTasks = getTasksForDate(dateStr);
            const hasItems = dayEvents.length > 0 || dayTasks.length > 0;

            return (
              <motion.button
                key={day}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all text-sm font-medium
                  ${isSelected
                    ? 'bg-[#3D7A6F] text-white'
                    : isToday
                      ? 'bg-[#E8F5F2] text-[#3D7A6F] font-extrabold'
                      : 'text-[#1E2A2A] hover:bg-slate-50'
                  }`}
              >
                {day}
                {hasItems && !isSelected && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 2).map((ev, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: EVENT_PALETTES[colorToPalette(ev.color)].dot }}
                      />
                    ))}
                    {dayTasks.length > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Selected Day Detail ───────────────────────────────────── */}
      {selectedDate && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-[#1E2A2A] font-bold text-base mb-3 capitalize">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </h3>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {selectedEvents.map((event) => {
                const pal = EVENT_PALETTES[colorToPalette(event.color)];
                return (
                  <motion.div
                    key={event.id} layout
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl p-4 flex items-start gap-3 border border-slate-100 shadow-sm"
                  >
                    {/* Color bar */}
                    <div className={`w-1 rounded-full self-stretch min-h-[52px] flex-shrink-0 ${pal.bg}`} />

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1E2A2A] text-sm">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{event.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`flex items-center gap-1 text-xs font-medium ${pal.text}`}>
                          <Clock className="w-3 h-3" />
                          {event.startTime} → {event.endTime}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button variant="ghost" size="icon"
                      onClick={() => deleteEvent(event.id)}
                      className="text-slate-300 hover:text-[#E8725A] flex-shrink-0 w-8 h-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                );
              })}

              {selectedTasks.map((task) => (
                <motion.div
                  key={task.id} layout
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl p-3.5 flex items-center gap-3 border border-slate-100 opacity-70"
                >
                  <div className="w-1 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tarefa</p>
                    <p className="font-semibold text-sm text-[#1E2A2A]">{task.title}</p>
                  </div>
                  {task.time && (
                    <span className="text-xs text-slate-400">{task.time}</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {selectedEvents.length === 0 && selectedTasks.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-10">
                <div className="w-14 h-14 bg-[#FEF3EE] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CalendarDays className="w-7 h-7 text-[#E8725A]" />
                </div>
                <p className="font-semibold text-[#1E2A2A] text-sm">Dia livre!</p>
                <p className="text-xs text-slate-400 mt-1">Nenhum evento para este dia</p>
              </motion.div>
            )}
          </div>
        </motion.section>
      )}

      {/* ── FAB ──────────────────────────────────────────────────── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 w-14 h-14 bg-[#E8725A] rounded-full
                       shadow-[0_8px_24px_rgba(232,114,90,0.4)] flex items-center justify-center z-30"
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo Evento</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="ev-title">Título</Label>
              <Input id="ev-title" value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Nome do evento" className="mt-1" autoFocus />
            </div>
            <div>
              <Label htmlFor="ev-desc">Descrição (opcional)</Label>
              <Input id="ev-desc" value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Detalhes do evento..." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="ev-date">Data</Label>
              <Input id="ev-date" type="date" value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ev-start">Início</Label>
                <Input id="ev-start" type="time" value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="ev-end">Término</Label>
                <Input id="ev-end" type="time" value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="ev-loc">Local (opcional)</Label>
              <Input id="ev-loc" value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Onde será o evento?" className="mt-1" />
            </div>
            {/* Color dots */}
            <div>
              <Label>Cor</Label>
              <div className="flex gap-2 mt-2">
                {EVENT_PALETTES.map((pal, idx) => (
                  <button key={idx} type="button"
                    onClick={() => setSelectedPalette(idx)}
                    className={`w-8 h-8 rounded-full ${pal.bg} transition-transform ${selectedPalette === idx ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'opacity-70'
                      }`}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#E8725A] hover:bg-[#E8725A]/90 text-white">
              Adicionar Evento
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
