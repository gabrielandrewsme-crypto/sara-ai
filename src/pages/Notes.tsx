import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, Edit2, Eye, X } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const NOTE_COLORS = [
  'bg-sara-teal-light',
  'bg-sara-coral-light',
  'bg-sara-lavender-light',
  'bg-sara-mint-light',
  'bg-sara-gold-light',
];

export const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useSara();
  const [isOpen, setIsOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<typeof notes[0] | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    date: '',
    color: NOTE_COLORS[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() && !newNote.content.trim()) return;
    
    if (editingNote) {
      updateNote(editingNote, newNote);
      setEditingNote(null);
    } else {
      addNote(newNote);
    }
    
    setNewNote({ title: '', content: '', date: '', color: NOTE_COLORS[0] });
    setIsOpen(false);
  };

  const handleEdit = (note: typeof notes[0]) => {
    setViewingNote(null);
    setNewNote({
      title: note.title,
      content: note.content,
      date: note.date || '',
      color: note.color || NOTE_COLORS[0],
    });
    setEditingNote(note.id);
    setIsOpen(true);
  };

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="py-4">
      {/* Notes Grid */}
      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {sortedNotes.map((note, index) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className={`sara-card ${note.color || 'bg-card'} relative group min-h-[120px] cursor-pointer`}
              onClick={() => setViewingNote(note)}
            >
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); handleEdit(note); }}
                  className="w-7 h-7 bg-card/80 backdrop-blur"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className="w-7 h-7 bg-card/80 backdrop-blur text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              {note.title && (
                <h3 className="font-semibold text-foreground mb-2 pr-14 line-clamp-2">
                  {note.title}
                </h3>
              )}
              <p className="text-sm text-muted-foreground line-clamp-4">
                {note.content}
              </p>
              
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                {note.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(note.date).toLocaleDateString('pt-BR')}
                  </span>
                )}
                <span>
                  {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {notes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-muted-foreground">Nenhuma nota criada</p>
          <p className="text-sm text-muted-foreground mt-1">
            Toque no + para criar sua primeira nota
          </p>
        </motion.div>
      )}

      {/* View Note Dialog */}
      <Dialog open={!!viewingNote} onOpenChange={(open) => { if (!open) setViewingNote(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{viewingNote?.title || 'Nota'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {viewingNote?.content}
            </p>
            {viewingNote?.date && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(viewingNote.date).toLocaleDateString('pt-BR')}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Atualizado em {viewingNote && new Date(viewingNote.updatedAt).toLocaleDateString('pt-BR')}
            </p>
            <Button
              className="w-full bg-sara-lavender hover:bg-sara-lavender/90"
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
        if (!open) {
          setEditingNote(null);
          setNewNote({ title: '', content: '', date: '', color: NOTE_COLORS[0] });
        }
      }}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 w-14 h-14 bg-sara-lavender rounded-2xl shadow-lg flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-card" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Editar Nota' : 'Nova Nota'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Título da nota..."
                className="sara-input"
              />
            </div>

            <div>
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Escreva sua nota aqui..."
                className="sara-input min-h-[120px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor="date">Data vinculada (opcional)</Label>
              <Input
                id="date"
                type="date"
                value={newNote.date}
                onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                className="sara-input"
              />
            </div>

            <div>
              <Label>Cor</Label>
              <div className="flex gap-2 mt-2">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewNote({ ...newNote, color })}
                    className={`w-8 h-8 rounded-full ${color} ${
                      newNote.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-sara-lavender hover:bg-sara-lavender/90">
              {editingNote ? 'Salvar Alterações' : 'Criar Nota'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notes;
