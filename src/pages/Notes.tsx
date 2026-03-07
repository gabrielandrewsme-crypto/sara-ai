import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Plus, Trash2, Calendar, Edit2, X, Search } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// ─── Color palette ────────────────────────────────────────────────────────────
const NOTE_PALETTES = [
  { bg: 'bg-[#EDE9FE]', border: 'border-[#5C2D91]/15', accent: '#5C2D91', dot: 'bg-[#5C2D91]' },
  { bg: 'bg-[#FEF3EE]', border: 'border-[#E8725A]/15', accent: '#E8725A', dot: 'bg-[#E8725A]' },
  { bg: 'bg-[#EEF3FE]', border: 'border-[#5B7BE8]/15', accent: '#5B7BE8', dot: 'bg-[#5B7BE8]' },
  { bg: 'bg-[#FEFBEE]', border: 'border-[#E8B725]/15', accent: '#E8B725', dot: 'bg-[#E8B725]' },
  { bg: 'bg-[#F5EEF8]', border: 'border-[#9B59B6]/15', accent: '#9B59B6', dot: 'bg-[#9B59B6]' },
];

// For backward compat — map old CSS class names to palette index
const colorToPaletteIndex = (color: string | undefined): number => {
  if (!color) return 0;
  if (color.includes('coral')) return 1;
  if (color.includes('lavender')) return 2;
  if (color.includes('gold')) return 3;
  if (color.includes('mint')) return 4;
  return 0;
};

const NOTE_COLORS_LEGACY = [
  'bg-sara-teal-light',
  'bg-sara-coral-light',
  'bg-sara-lavender-light',
  'bg-sara-mint-light',
  'bg-sara-gold-light',
];

// ─── Component ────────────────────────────────────────────────────────────────

export const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useSara();
  const [isOpen, setIsOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<typeof notes[0] | null>(null);
  const [search, setSearch] = useState('');
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [newNote, setNewNote] = useState({ title: '', content: '', date: '', color: NOTE_COLORS_LEGACY[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() && !newNote.content.trim()) return;
    const noteData = { ...newNote, color: NOTE_COLORS_LEGACY[selectedPalette] };
    if (editingNote) {
      updateNote(editingNote, noteData);
      setEditingNote(null);
    } else {
      addNote(noteData);
    }
    setNewNote({ title: '', content: '', date: '', color: NOTE_COLORS_LEGACY[0] });
    setSelectedPalette(0);
    setIsOpen(false);
  };

  const handleEdit = (note: typeof notes[0]) => {
    setViewingNote(null);
    setNewNote({ title: note.title, content: note.content, date: note.date || '', color: note.color || NOTE_COLORS_LEGACY[0] });
    setSelectedPalette(colorToPaletteIndex(note.color));
    setEditingNote(note.id);
    setIsOpen(true);
  };

  const sortedNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="py-4 space-y-4">
      {/* Search */}
      {notes.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar notas..."
            className="pl-9 bg-white border-slate-200 rounded-xl h-11"
          />
        </div>
      )}

      {/* Notes Masonry Grid */}
      <div className="columns-2 gap-3 space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedNotes.map((note, index) => {
            const paletteIdx = colorToPaletteIndex(note.color);
            const palette = NOTE_PALETTES[paletteIdx];
            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.04 }}
                className={`break-inside-avoid ${palette.bg} border ${palette.border} rounded-2xl p-4
                            relative group cursor-pointer mb-3 shadow-sm`}
                onClick={() => setViewingNote(note)}
              >
                {/* Actions overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(note); }}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm hover:shadow transition-shadow"
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm hover:shadow transition-shadow"
                  >
                    <Trash2 className="w-3 h-3 text-[#E8725A]" />
                  </button>
                </div>

                {note.title && (
                  <h3 className="font-bold text-[#1E2A2A] mb-1.5 pr-14 text-sm line-clamp-2">
                    {note.title}
                  </h3>
                )}
                <p className="text-xs text-slate-500 line-clamp-5 leading-relaxed">
                  {note.content}
                </p>

                <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between">
                  {note.date ? (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.date).toLocaleDateString('pt-BR')}
                    </span>
                  ) : <span />}
                  <span className="text-[10px] text-slate-400">
                    {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {notes.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-16 h-16 bg-[#EEF3FE] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <StickyNote className="w-8 h-8 text-[#5B7BE8]" />
          </div>
          <p className="font-semibold text-[#1E2A2A]">Nenhuma nota criada</p>
          <p className="text-xs text-slate-400 mt-1">Toque no + para criar sua primeira nota</p>
        </motion.div>
      )}

      {/* View Note Dialog */}
      <Dialog open={!!viewingNote} onOpenChange={(open) => { if (!open) setViewingNote(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{viewingNote?.title || 'Nota'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {viewingNote?.content}
            </p>
            {viewingNote?.date && (
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Vinculada a {new Date(viewingNote.date).toLocaleDateString('pt-BR')}
              </p>
            )}
            <p className="text-xs text-slate-400">
              Atualizada em {viewingNote && new Date(viewingNote.updatedAt).toLocaleDateString('pt-BR')}
            </p>
            <Button
              className="w-full bg-[#5B7BE8] hover:bg-[#5B7BE8]/90 text-white"
              onClick={() => viewingNote && handleEdit(viewingNote)}
            >
              <Edit2 className="w-4 h-4 mr-2" /> Editar nota
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Note Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) { setEditingNote(null); setNewNote({ title: '', content: '', date: '', color: NOTE_COLORS_LEGACY[0] }); setSelectedPalette(0); }
      }}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 w-14 h-14 bg-[#5B7BE8] rounded-full
                       shadow-[0_8px_24px_rgba(91,123,232,0.4)] flex items-center justify-center z-30"
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Editar Nota' : 'Nova Nota'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título (opcional)</Label>
              <Input id="title" value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Título da nota..." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea id="content" value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Escreva sua nota aqui..." className="mt-1 min-h-[120px] resize-none" />
            </div>
            <div>
              <Label htmlFor="date">Data vinculada (opcional)</Label>
              <Input id="date" type="date" value={newNote.date}
                onChange={(e) => setNewNote({ ...newNote, date: e.target.value })} className="mt-1" />
            </div>
            {/* Color picker */}
            <div>
              <Label>Cor da nota</Label>
              <div className="flex gap-2 mt-2">
                {NOTE_PALETTES.map((palette, idx) => (
                  <button
                    key={idx} type="button"
                    onClick={() => setSelectedPalette(idx)}
                    className={`w-8 h-8 rounded-full ${palette.dot} transition-transform ${selectedPalette === idx ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'opacity-70'
                      }`}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#5B7BE8] hover:bg-[#5B7BE8]/90 text-white">
              {editingNote ? 'Salvar Alterações' : 'Criar Nota'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notes;
