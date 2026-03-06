import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Smile, Meh, Frown, Heart, ThumbsDown } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import type { DiaryEntry } from '@/types/sara';

const MOODS = [
  { value: 'great' as const, icon: Heart, label: 'Ótimo', color: 'text-green-500' },
  { value: 'good' as const, icon: Smile, label: 'Bem', color: 'text-emerald-400' },
  { value: 'neutral' as const, icon: Meh, label: 'Normal', color: 'text-yellow-500' },
  { value: 'bad' as const, icon: Frown, label: 'Ruim', color: 'text-orange-500' },
  { value: 'awful' as const, icon: ThumbsDown, label: 'Péssimo', color: 'text-red-500' },
];

const getMoodInfo = (mood: DiaryEntry['mood']) => MOODS.find(m => m.value === mood) || MOODS[2];

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

    if (editingId) {
      updateDiaryEntry(editingId, form);
      setEditingId(null);
    } else {
      addDiaryEntry(form);
    }
    setForm({ content: '', mood: 'neutral', highlights: '', date: new Date().toISOString().split('T')[0] });
    setIsOpen(false);
  };

  const handleEdit = (entry: DiaryEntry) => {
    setForm({ content: entry.content, mood: entry.mood, highlights: entry.highlights || '', date: entry.date });
    setEditingId(entry.id);
    setIsOpen(true);
  };

  const sorted = [...diaryEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="py-4">
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sorted.map((entry, i) => {
            const mood = getMoodInfo(entry.mood);
            const MoodIcon = mood.icon;
            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
                className="sara-card relative group"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} className="w-7 h-7 bg-card/80 backdrop-blur">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteDiaryEntry(entry.id)} className="w-7 h-7 bg-card/80 backdrop-blur text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <MoodIcon className={`w-5 h-5 ${mood.color}`} />
                  <span className="text-sm font-medium text-foreground">{mood.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                  </span>
                </div>

                <p className="text-sm text-foreground whitespace-pre-wrap">{entry.content}</p>

                {entry.highlights && (
                  <div className="mt-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                    <p className="text-xs text-primary font-medium">✨ {entry.highlights}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {diaryEntries.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p className="text-muted-foreground">Nenhuma entrada no diário</p>
          <p className="text-sm text-muted-foreground mt-1">Toque no + para registrar seu dia</p>
        </motion.div>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setEditingId(null);
          setForm({ content: '', mood: 'neutral', highlights: '', date: new Date().toISOString().split('T')[0] });
        }
      }}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 w-14 h-14 bg-sara-coral rounded-2xl shadow-lg flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-card" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar entrada' : 'Como foi seu dia?'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Como você está?</Label>
              <div className="flex gap-3 mt-2">
                {MOODS.map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setForm({ ...form, mood: m.value })}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        form.mood === m.value ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-muted'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${m.color}`} />
                      <span className="text-xs">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="sara-input"
              />
            </div>

            <div>
              <Label htmlFor="content">O que aconteceu hoje?</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Escreva sobre seu dia..."
                className="sara-input min-h-[120px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor="highlights">Destaque do dia (opcional)</Label>
              <Input
                id="highlights"
                value={form.highlights}
                onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                placeholder="O melhor momento do dia..."
                className="sara-input"
              />
            </div>

            <Button type="submit" className="w-full bg-sara-coral hover:bg-sara-coral/90">
              {editingId ? 'Salvar Alterações' : 'Registrar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Diary;
