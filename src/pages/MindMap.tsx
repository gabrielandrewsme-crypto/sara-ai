import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Lightbulb, ChevronRight } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MindMapNode } from '@/types/sara';

const NODE_COLORS = [
  'bg-sara-teal',
  'bg-sara-coral',
  'bg-sara-lavender',
  'bg-sara-mint',
  'bg-sara-gold',
];

export const MindMap: React.FC = () => {
  const { mindMaps, addMindMap, updateMindMap, deleteMindMap } = useSara();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [newMapTitle, setNewMapTitle] = useState('');
  const [newNodeText, setNewNodeText] = useState('');

  const handleCreateMap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapTitle.trim()) return;
    
    addMindMap({
      title: newMapTitle,
      nodes: [{
        id: '1',
        text: newMapTitle,
        x: 150,
        y: 100,
        color: NODE_COLORS[0],
        connections: [],
      }],
    });
    
    setNewMapTitle('');
    setIsOpen(false);
  };

  const handleAddNode = (mapId: string) => {
    if (!newNodeText.trim()) return;
    
    const map = mindMaps.find(m => m.id === mapId);
    if (!map) return;

    const newNode: MindMapNode = {
      id: Math.random().toString(36).substr(2, 9),
      text: newNodeText,
      x: Math.random() * 200 + 50,
      y: Math.random() * 150 + 50,
      color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
      connections: map.nodes.length > 0 ? [map.nodes[0].id] : [],
    };

    updateMindMap(mapId, {
      nodes: [...map.nodes, newNode],
    });
    
    setNewNodeText('');
  };

  const handleDeleteNode = (mapId: string, nodeId: string) => {
    const map = mindMaps.find(m => m.id === mapId);
    if (!map) return;

    const updatedNodes = map.nodes
      .filter(n => n.id !== nodeId)
      .map(n => ({
        ...n,
        connections: n.connections.filter(c => c !== nodeId),
      }));

    if (updatedNodes.length === 0) {
      deleteMindMap(mapId);
      setSelectedMap(null);
    } else {
      updateMindMap(mapId, { nodes: updatedNodes });
    }
  };

  const currentMap = mindMaps.find(m => m.id === selectedMap);

  if (selectedMap && currentMap) {
    return (
      <div className="py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setSelectedMap(null)}
            className="rounded-xl"
          >
            ← Voltar
          </Button>
          <h2 className="text-lg font-bold text-foreground">{currentMap.title}</h2>
        </div>

        {/* Simple Node View */}
        <div className="sara-card min-h-[300px] relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {currentMap.nodes.map(node => 
              node.connections.map(connId => {
                const connNode = currentMap.nodes.find(n => n.id === connId);
                if (!connNode) return null;
                return (
                  <line
                    key={`${node.id}-${connId}`}
                    x1={node.x + 40}
                    y1={node.y + 20}
                    x2={connNode.x + 40}
                    y2={connNode.y + 20}
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                  />
                );
              })
            )}
          </svg>
          
          {currentMap.nodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              drag
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const updatedNodes = currentMap.nodes.map(n => 
                  n.id === node.id 
                    ? { ...n, x: node.x + info.offset.x, y: node.y + info.offset.y }
                    : n
                );
                updateMindMap(currentMap.id, { nodes: updatedNodes });
              }}
              style={{ left: node.x, top: node.y }}
              className={`absolute ${node.color} text-card px-4 py-2 rounded-xl shadow-lg cursor-move group`}
            >
              <span className="font-medium">{node.text}</span>
              {index > 0 && (
                <button
                  onClick={() => handleDeleteNode(currentMap.id, node.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Add Node */}
        <div className="flex gap-2">
          <Input
            value={newNodeText}
            onChange={(e) => setNewNodeText(e.target.value)}
            placeholder="Nova ideia..."
            className="sara-input flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddNode(currentMap.id);
              }
            }}
          />
          <Button
            onClick={() => handleAddNode(currentMap.id)}
            className="bg-gradient-sara"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4">
      {/* Maps List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {mindMaps.map((map, index) => (
            <motion.div
              key={map.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="sara-card flex items-center gap-3 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedMap(map.id)}
            >
              <div className="w-12 h-12 bg-sara-gold-light rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-sara-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{map.title}</p>
                <p className="text-sm text-muted-foreground">
                  {map.nodes.length} {map.nodes.length === 1 ? 'ideia' : 'ideias'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMindMap(map.id);
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {mindMaps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Lightbulb className="w-12 h-12 text-sara-gold mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Nenhum mapa mental criado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Organize suas ideias visualmente
            </p>
          </motion.div>
        )}
      </div>

      {/* Add Map Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 w-14 h-14 bg-sara-gold rounded-2xl shadow-lg flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-card" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Mapa Mental</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateMap} className="space-y-4">
            <div>
              <Label htmlFor="title">Ideia Central</Label>
              <Input
                id="title"
                value={newMapTitle}
                onChange={(e) => setNewMapTitle(e.target.value)}
                placeholder="Ex: Projeto novo, Lista de compras..."
                className="sara-input"
              />
            </div>
            <Button type="submit" className="w-full bg-sara-gold hover:bg-sara-gold/90 text-card">
              Criar Mapa
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MindMap;
