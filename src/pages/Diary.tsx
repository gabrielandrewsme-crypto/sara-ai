import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Smile, Meh, Frown, Heart, ThumbsDown, BookHeart } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import type { DiaryEntry } from '@/types/sara';

// ─── Mood config ──────────────────────────────────────────────────────────────
const MOODS = [
  { value: 'great' as const, icon: Heart, label: 'Ótimo', bg: 'bg-[#E8F5F2]', text: 'text-[#3D7A6F]', bar: 'bg-[#3D7A6F]', border: 'border-[#3D7A6F]/20' },
  { value: 'good' as const, icon: Smile, label: 'Bem', bg: 'bg-[#EEF3FE]', text: 'text-[#5B7BE8]', bar: 'bg-[#5B7BE8]', border: 'border-[#5B7BE8]/20' },
  { value: 'neutral' as const, icon: Meh, label: 'Normal', bg: 'bg-[#FEFBEE]', text: 'text-[#E8B725]', bar: 'bg-[#E8B725]', border: 'border-[#E8B725]/20' },
  { value: 'bad' as const, icon: Frown, label: 'Ruim', bg: 'bg-[#FEF3EE]', text: 'text-[#E8725A]', bar: 'bg-[#E8725A]', border: 'border-[#E8725A]/20' },
  { value: 'awful' as const, icon: ThumbsDown, label: 'Péssimo', bg: 'bg-red-50', text: 'text-red-500', bar: 'bg-red-500', border: 'border-red-200' },
];

const getMood = (mood: DiaryEntry['mood']) =>
  MOODS.find(m => m.value === mood) ?? MOODS[2];

const weekday = (dateStr: string) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

// ─── Component ────────────────────────────────────────────────────────────────
export const Diary: React.FC = () => {
  const { diaryEntries, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry } = useSara();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    content: '',
    mood: 'neutral' as DiaryEntry['mood'],
    highlights: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    editingId ? updateDiaryEntry(editingId, form) : addDiaryEntry(form);
    setEditingId(null);
    setForm({ content: '', mood: 'neutral', highlights: '', date: new Date().toISOString().split('T')[0] });
    setIsOpen(false);
  };

  const handleEdit = (entry: DiaryEntry) => {
    setForm({ content: entry.content, mood: entry.mood, highlights: entry.highlights || '', date: entry.date });
    setEditingId(entry.id);
    setIsOpen(true);
  };

  const sorted = [...diaryEntries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="py-4 space-y-3">

      <AnimatePresence mode="popLayout">
        {sorted.map((entry, i) => {
          const mood = getMood(entry.mood);
          const MoodIcon = mood.icon;
          return (
            <motion.div
              key={entry.id} layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border ${mood.border} shadow-sm relative group overflow-hidden`}
            >
              {/* Mood color bar on left */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${mood.bar}`} />

              <div className="pl-4 pr-4 pt-4 pb-3">
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`${mood.bg} rounded-xl p-1.5`}>
                    <MoodIcon className={`w-4 h-4 ${mood.text}`} />
                  </div>
                  <span className={`text-sm font-bold ${mood.text}`}>{mood.label}</span>
                  <span className="text-xs text-slate-400 ml-auto capitalize">
                    {weekday(entry.date)}
                  </span>
                  {/* Edit/Delete */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(entry)}
                      className="w-7 h-7 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors">
                      <Edit2 className="w-3 h-3 text-slate-500" />
                    </button>
                    <button onClick={() => deleteDiaryEntry(entry.id)}
                      className="w-7 h-7 bg-slate-50 hover:bg-[#FEF3EE] rounded-lg flex items-center justify-center transition-colors">
                      <Trash2 className="w-3 h-3 text-[#E8725A]" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-[#1E2A2A] whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>

                {/* Highlight */}
                {entry.highlights && (
                  <div className={`mt-3 px-3 py-2 ${mood.bg} rounded-xl`}>
                    <p className={`text-xs font-semibold ${mood.text}`}>
                      ✨ {entry.highlights}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {diaryEntries.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-16 h-16 bg-[#FEF3EE] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <BookHeart className="w-8 h-8 text-[#E8725A]" />
          </div>
          <p className="font-semibold text-[#1E2A2A]">Nenhuma entrada ainda</p>
          <p className="text-xs text-slate-400 mt-1">Registre como foi seu dia</p>
        </motion.div>
      )}

      {/* ── Dialog ────────────────────────────────────────────────── */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setEditingId(null);
          setForm({ content: '', mood: 'neutral', highlights: '', date: new Date().toISOString().split('T')[0] });
        }
      }}>
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
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar entrada' : 'Como foi seu dia?'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mood selector */}
            <div>
              <Label>Como você está?</Label>
              <div className="flex gap-2 mt-2">
                {MOODS.map(m => {
                  const Icon = m.icon;
                  const isActive = form.mood === m.value;
                  return (
                    <button
                      key={m.value} type="button"
                      onClick={() => setForm({ ...form, mood: m.value })}
                      className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${isActive
                          ? `${m.bg} ${m.border} ${m.text}`
                          : 'border-transparent hover:bg-slate-50'
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? m.text : 'text-slate-400'}`} />
                      <span className={`text-[10px] font-semibold ${isActive ? m.text : 'text-slate-400'}`}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="diary-date">Data</Label>
              <Input id="diary-date" type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="diary-content">O que aconteceu hoje?</Label>
              <Textarea id="diary-content" value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Escreva sobre seu dia..." className="mt-1 min-h-[120px] resize-none" />
            </div>

            <div>
              <Label htmlFor="diary-highlights">Destaque do dia (opcional)</Label>
              <Input id="diary-highlights" value={form.highlights}
                onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                placeholder="O melhor momento do dia..." className="mt-1" />
            </div>

            <Button type="submit" className="w-full bg-[#E8725A] hover:bg-[#E8725A]/90 text-white">
              {editingId ? 'Salvar Alterações' : 'Registrar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Diary;
