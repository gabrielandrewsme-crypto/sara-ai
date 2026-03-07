import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Lightbulb, ChevronRight, ArrowLeft, X } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MindMapNode } from '@/types/sara';

// ─── Design tokens ────────────────────────────────────────────────────────────
const PALETTES = [
  { fill: '#3D7A6F', light: '#E8F5F2', text: '#fff' },
  { fill: '#E8725A', light: '#FEF3EE', text: '#fff' },
  { fill: '#5B7BE8', light: '#EEF3FE', text: '#fff' },
  { fill: '#E8B725', light: '#FEFBEE', text: '#fff' },
  { fill: '#9B59B6', light: '#F5EEF8', text: '#fff' },
];

// Map legacy css class → palette index
const legacyToIdx = (color: string): number => {
  if (color.includes('coral')) return 1;
  if (color.includes('lavender')) return 2;
  if (color.includes('gold')) return 3;
  if (color.includes('mint') && !color.includes('teal')) return 4;
  return 0;
};

const NODE_COLORS_LEGACY = [
  'bg-sara-teal', 'bg-sara-coral', 'bg-sara-lavender', 'bg-sara-mint', 'bg-sara-gold',
];

// Approximate node dimensions for SVG line endpoints
const NODE_W = 88;
const NODE_H = 34;

// ─── Canvas View ──────────────────────────────────────────────────────────────
interface CanvasProps {
  mapId: string;
  mapTitle: string;
  nodes: MindMapNode[];
  onBack: () => void;
  updateMindMap: (id: string, data: Partial<{ title: string; nodes: MindMapNode[] }>) => void;
  deleteMindMap: (id: string) => void;
}

const MapCanvas: React.FC<CanvasProps> = ({ mapId, mapTitle, nodes, onBack, updateMindMap, deleteMindMap }) => {
  const [newNodeText, setNewNodeText] = useState('');
  const [selectedPalette, setSelectedPalette] = useState(
    Math.floor(Math.random() * PALETTES.length)
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Track node positions locally for smooth drag
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  const getPos = (node: MindMapNode) => ({
    x: positions[node.id]?.x ?? node.x,
    y: positions[node.id]?.y ?? node.y,
  });

  const handleAddNode = useCallback(() => {
    if (!newNodeText.trim()) return;
    const count = nodes.length;
    // Spread nodes in a circle around the root
    const angle = ((count - 1) / Math.max(count - 1, 1)) * 2 * Math.PI;
    const r = 110;
    const rootPos = getPos(nodes[0]);
    const x = count === 0 ? 110 : rootPos.x + r * Math.cos(angle);
    const y = count === 0 ? 80 : rootPos.y + r * Math.sin(angle);

    const newNode: MindMapNode = {
      id: Math.random().toString(36).substr(2, 9),
      text: newNodeText,
      x: Math.max(8, Math.round(x)),
      y: Math.max(8, Math.round(y)),
      color: NODE_COLORS_LEGACY[selectedPalette],
      connections: nodes.length > 0 ? [nodes[0].id] : [],
    };
    updateMindMap(mapId, { nodes: [...nodes, newNode] });
    setNewNodeText('');
    inputRef.current?.focus();
    // Rotate palette
    setSelectedPalette((p) => (p + 1) % PALETTES.length);
  }, [newNodeText, nodes, mapId, selectedPalette, updateMindMap]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    const updated = nodes
      .filter(n => n.id !== nodeId)
      .map(n => ({ ...n, connections: n.connections.filter(c => c !== nodeId) }));
    if (updated.length === 0) { deleteMindMap(mapId); onBack(); return; }
    updateMindMap(mapId, { nodes: updated });
  }, [nodes, mapId, updateMindMap, deleteMindMap, onBack]);

  const handleDragEnd = useCallback(
    (nodeId: string, offsetX: number, offsetY: number) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      const newX = Math.max(0, node.x + offsetX);
      const newY = Math.max(0, node.y + offsetY);
      setPositions(prev => ({ ...prev, [nodeId]: { x: newX, y: newY } }));
      updateMindMap(mapId, {
        nodes: nodes.map(n => n.id === nodeId ? { ...n, x: newX, y: newY } : n),
      });
    },
    [nodes, mapId, updateMindMap]
  );

  return (
    <div className="py-4 space-y-4">
      {/* Header bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <h2 className="text-base font-extrabold text-[#1E2A2A] flex-1 truncate">{mapTitle}</h2>
        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
          {nodes.length} {nodes.length === 1 ? 'ideia' : 'ideias'}
        </span>
      </div>

      {/* Canvas */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        style={{ minHeight: 320, position: 'relative' }}>
        {/* Subtle dot grid background */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#E2E8F0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />

          {/* Connection lines */}
          {nodes.map(node =>
            node.connections.map(connId => {
              const conn = nodes.find(n => n.id === connId);
              if (!conn) return null;
              const p1 = getPos(node);
              const p2 = getPos(conn);
              const pal = PALETTES[legacyToIdx(node.color)];
              return (
                <line
                  key={`${node.id}-${connId}`}
                  x1={p1.x + NODE_W / 2} y1={p1.y + NODE_H / 2}
                  x2={p2.x + NODE_W / 2} y2={p2.y + NODE_H / 2}
                  stroke={pal.fill}
                  strokeWidth="2"
                  strokeOpacity="0.35"
                  strokeDasharray="6 3"
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        <div style={{ position: 'relative', minHeight: 320 }}>
          {nodes.map((node, index) => {
            const pal = PALETTES[legacyToIdx(node.color)];
            const pos = getPos(node);
            const isRoot = index === 0;

            return (
              <motion.div
                key={node.id}
                drag
                dragMomentum={false}
                onDragEnd={(_, info) => handleDragEnd(node.id, info.offset.x, info.offset.y)}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.06, type: 'spring', stiffness: 300 }}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  touchAction: 'none',
                  zIndex: isRoot ? 2 : 1,
                }}
                className="group"
              >
                <div
                  style={{
                    backgroundColor: pal.fill,
                    boxShadow: `0 4px 14px ${pal.fill}55`,
                  }}
                  className={`px-4 py-2 rounded-2xl cursor-move select-none whitespace-nowrap
                    ${isRoot ? 'ring-2 ring-white ring-offset-2' : ''}`}
                >
                  <span className="text-white font-bold text-sm">{node.text}</span>
                </div>

                {/* Delete button — never show for root unless it's the only node */}
                {(!isRoot || nodes.length === 1) && (
                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-[#E8725A] text-white
                               rounded-full opacity-0 group-hover:opacity-100 transition-all
                               flex items-center justify-center shadow-sm z-10 text-[10px] font-bold"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <p className="text-[11px] text-slate-400 text-center">
        Arraste os nós para reorganizar · Segure para mover
      </p>

      {/* Add node input */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
        <div className="flex gap-2 items-center mb-2">
          {/* Color dots */}
          <div className="flex gap-1.5">
            {PALETTES.map((pal, idx) => (
              <button key={idx} type="button"
                onClick={() => setSelectedPalette(idx)}
                className="w-5 h-5 rounded-full transition-transform"
                style={{
                  backgroundColor: pal.fill,
                  transform: selectedPalette === idx ? 'scale(1.35)' : 'scale(1)',
                  opacity: selectedPalette === idx ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newNodeText}
            onChange={(e) => setNewNodeText(e.target.value)}
            placeholder="Nova ideia..."
            className="flex-1 h-10 rounded-xl border-slate-200"
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddNode(); }}
          />
          <button
            onClick={handleAddNode}
            disabled={!newNodeText.trim()}
            style={{ backgroundColor: PALETTES[selectedPalette].fill }}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                       disabled:opacity-40 transition-opacity"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Maps List View ───────────────────────────────────────────────────────────
export const MindMap: React.FC = () => {
  const { mindMaps, addMindMap, updateMindMap, deleteMindMap } = useSara();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [newMapTitle, setNewMapTitle] = useState('');

  const handleCreateMap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapTitle.trim()) return;
    addMindMap({
      title: newMapTitle,
      nodes: [{
        id: '1',
        text: newMapTitle,
        x: 110,
        y: 100,
        color: NODE_COLORS_LEGACY[0],
        connections: [],
      }],
    });
    setNewMapTitle('');
    setIsOpen(false);
  };

  const currentMap = mindMaps.find(m => m.id === selectedMap);

  // ── Canvas view ──────────────────────────────────────────
  if (selectedMap && currentMap) {
    return (
      <MapCanvas
        mapId={currentMap.id}
        mapTitle={currentMap.title}
        nodes={currentMap.nodes}
        onBack={() => setSelectedMap(null)}
        updateMindMap={updateMindMap}
        deleteMindMap={deleteMindMap}
      />
    );
  }

  // ── List view ────────────────────────────────────────────
  return (
    <div className="py-4 space-y-3">
      <AnimatePresence mode="popLayout">
        {mindMaps.map((map, index) => {
          // Pick dominant color from first non-root node (or root)
          const accentNode = map.nodes[1] ?? map.nodes[0];
          const pal = accentNode ? PALETTES[legacyToIdx(accentNode.color)] : PALETTES[3];

          return (
            <motion.div
              key={map.id} layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3
                         p-4 cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => setSelectedMap(map.id)}
            >
              {/* Icon bubble */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: pal.light }}
              >
                <Lightbulb className="w-6 h-6" style={{ color: pal.fill }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1E2A2A] truncate">{map.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {map.nodes.length} {map.nodes.length === 1 ? 'ideia' : 'ideias'}
                </p>
              </div>

              {/* Mini node preview dots */}
              <div className="flex gap-1 flex-shrink-0">
                {map.nodes.slice(0, 5).map((n, i) => (
                  <div key={i} className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PALETTES[legacyToIdx(n.color)].fill, opacity: 0.6 + i * 0.08 }} />
                ))}
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 group-hover:text-slate-500 transition-colors" />

              <button
                onClick={(e) => { e.stopPropagation(); deleteMindMap(map.id); }}
                className="w-8 h-8 rounded-lg text-slate-300 hover:text-[#E8725A] hover:bg-[#FEF3EE]
                           flex items-center justify-center transition-all flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {mindMaps.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-16 h-16 bg-[#FEFBEE] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lightbulb className="w-8 h-8 text-[#E8B725]" />
          </div>
          <p className="font-semibold text-[#1E2A2A]">Nenhum mapa mental</p>
          <p className="text-xs text-slate-400 mt-1">Organize suas ideias visualmente</p>
        </motion.div>
      )}

      {/* FAB */}
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
          <DialogHeader><DialogTitle>Novo Mapa Mental</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateMap} className="space-y-4">
            <div>
              <Label htmlFor="mm-title">Ideia Central</Label>
              <Input id="mm-title" value={newMapTitle}
                onChange={(e) => setNewMapTitle(e.target.value)}
                placeholder="Ex: Objetivos 2025, Projeto X..." className="mt-1" autoFocus />
            </div>
            <Button type="submit"
              style={{ backgroundColor: '#E8B725' }}
              className="w-full text-white hover:opacity-90">
              Criar Mapa
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MindMap;
