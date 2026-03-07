import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Moon, Sun, Bell, BellOff, ChevronRight, Shield,
  Heart, LogOut, BellRing, Smartphone, Pencil, RotateCcw, CalendarDays,
  MessageSquare, ExternalLink,
} from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

// ─── Reusable section wrapper ─────────────────────────────────────────────────
const Section: React.FC<{ title?: string; delay?: number; children: React.ReactNode }> = ({
  title, delay = 0, children,
}) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="space-y-2"
  >
    {title && (
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
        {title}
      </p>
    )}
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
      {children}
    </div>
  </motion.section>
);

// ─── Row component ────────────────────────────────────────────────────────────
interface RowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}
const Row: React.FC<RowProps> = ({ icon, iconBg, label, sub, right, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/80 transition-colors disabled:cursor-default"
    disabled={!onClick}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-[#1E2A2A] text-sm">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
    {right ?? (onClick ? <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" /> : null)}
  </button>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const Settings: React.FC = () => {
  const { user, setUser, theme, toggleTheme } = useSara();
  const { isAdmin, signOut } = useAuth();
  const { permission, requestPermission, isSupported } = useNotifications();
  const navigate = useNavigate();

  const [isNameOpen, setIsNameOpen] = useState(false);
  const [newName, setNewName] = useState(user.name);

  const handleNameSave = () => {
    if (newName.trim()) {
      setUser({ ...user, name: newName.trim() });
      setIsNameOpen(false);
      toast.success('Nome atualizado!');
    }
  };

  const toggleNotif = (key: keyof typeof user.notifications) => {
    setUser({ ...user, notifications: { ...user.notifications, [key]: !user.notifications[key] } });
  };

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      toast.success('Notificações ativadas! 🔔', { description: 'Você receberá lembretes da rotina e agenda.' });
    } else if (result === 'denied') {
      toast.error('Notificações bloqueadas', { description: 'Acesse as configurações do navegador.' });
    }
  };

  // Derive initials for avatar
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="py-4 space-y-5">

      {/* ── Profile Hero Card ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
      >
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-extrabold text-[#5C2D91]">{initials || '👤'}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-lg font-extrabold text-[#1E2A2A] truncate">{user.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">Assistente pessoal com Sara AI</p>
        </div>

        <Dialog open={isNameOpen} onOpenChange={setIsNameOpen}>
          <DialogTrigger asChild>
            <button className="w-9 h-9 bg-[#EDE9FE] rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-[#d4ede8] transition-colors">
              <Pencil className="w-4 h-4 text-[#5C2D91]" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Editar Nome</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Como você quer ser chamada?" className="mt-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()} />
              </div>
              <Button onClick={handleNameSave} className="w-full bg-[#5C2D91] hover:bg-[#5C2D91]/90 text-white">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* ── WhatsApp ──────────────────────────────────────────────── */}
      <Section title="Conexão" delay={0.05}>
        <Row
          icon={<MessageSquare className="w-5 h-5 text-[#25D366]" />}
          iconBg="bg-[#EDE9FE]"
          label="Falar com a Sara"
          sub="Abre o WhatsApp para conversar"
          onClick={() => window.open('https://wa.me/5511999999999?text=Oi+Sara!', '_blank')}
          right={<ExternalLink className="w-4 h-4 text-slate-300 flex-shrink-0" />}
        />
      </Section>

      {/* ── Appearance ────────────────────────────────────────────── */}
      <Section title="Aparência" delay={0.1}>
        <Row
          icon={theme === 'dark'
            ? <Moon className="w-5 h-5 text-[#5B7BE8]" />
            : <Sun className="w-5 h-5 text-[#E8B725]" />}
          iconBg={theme === 'dark' ? 'bg-[#EEF3FE]' : 'bg-[#FEFBEE]'}
          label={`Tema ${theme === 'dark' ? 'Escuro' : 'Claro'}`}
          sub="Toque para alternar"
          onClick={toggleTheme}
          right={
            <div className={`w-11 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${theme === 'dark' ? 'bg-[#5B7BE8]' : 'bg-slate-200'}`}>
              <motion.div
                layout
                className="w-5 h-5 rounded-full bg-white shadow"
                animate={{ x: theme === 'dark' ? 16 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          }
        />
      </Section>

      {/* ── Notification Permission ───────────────────────────────── */}
      {isSupported && (
        <Section title="Notificações" delay={0.15}>
          {permission === 'granted' && (
            <Row
              icon={<BellRing className="w-5 h-5 text-[#5C2D91]" />}
              iconBg="bg-[#EDE9FE]"
              label="Notificações ativas ✅"
              sub="Você receberá alertas da rotina e agenda"
            />
          )}
          {permission === 'denied' && (
            <Row
              icon={<BellOff className="w-5 h-5 text-[#E8725A]" />}
              iconBg="bg-[#FEF3EE]"
              label="Notificações bloqueadas"
              sub="Acesse as configurações do navegador para permitir"
            />
          )}
          {permission === 'default' && (
            <Row
              icon={<Bell className="w-5 h-5 text-[#E8B725]" />}
              iconBg="bg-[#FEFBEE]"
              label="Ativar notificações"
              sub="Receba lembretes da rotina e agenda"
              onClick={handleEnableNotifications}
              right={
                <button
                  onClick={handleEnableNotifications}
                  className="flex-shrink-0 text-xs font-bold px-3 py-1.5 bg-[#E8B725] text-white rounded-lg"
                >
                  Ativar
                </button>
              }
            />
          )}
        </Section>
      )}

      {/* ── Notification Types ────────────────────────────────────── */}
      <Section title="Tipos de alerta" delay={0.2}>
        {[
          { key: 'tasks' as const, icon: <RotateCcw className="w-5 h-5 text-[#5C2D91]" />, bg: 'bg-[#EDE9FE]', label: 'Rotina', sub: 'Tarefas diárias e lembretes' },
          { key: 'events' as const, icon: <CalendarDays className="w-5 h-5 text-[#E8725A]" />, bg: 'bg-[#FEF3EE]', label: 'Eventos', sub: 'Alertas da agenda' },
          { key: 'financial' as const, icon: <Bell className="w-5 h-5 text-[#E8B725]" />, bg: 'bg-[#FEFBEE]', label: 'Finanças', sub: 'Alertas de gastos' },
        ].map(({ key, icon, bg, label, sub }) => (
          <Row
            key={key}
            icon={icon}
            iconBg={bg}
            label={label}
            sub={sub}
            right={
              <Switch
                checked={user.notifications[key]}
                onCheckedChange={() => toggleNotif(key)}
                className="flex-shrink-0"
              />
            }
          />
        ))}
      </Section>

      {/* ── App ───────────────────────────────────────────────────── */}
      <Section title="Aplicativo" delay={0.25}>
        <Row
          icon={<Smartphone className="w-5 h-5 text-[#5B7BE8]" />}
          iconBg="bg-[#EEF3FE]"
          label="Instalar no celular"
          sub="Instruções para iPhone e Android"
          onClick={() => navigate('/install')}
        />
        {isAdmin && (
          <Row
            icon={<Shield className="w-5 h-5 text-[#9B59B6]" />}
            iconBg="bg-[#F5EEF8]"
            label="Painel Admin"
            sub="Gerenciar clientes e assinaturas"
            onClick={() => navigate('/admin/clients')}
          />
        )}
      </Section>

      {/* ── Logout ────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-[#E8725A]/30
                     text-[#E8725A] font-semibold text-sm hover:bg-[#FEF3EE] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </motion.div>

      {/* ── About ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center"
      >
        <div className="w-14 h-14 bg-[#EDE9FE] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Heart className="w-7 h-7 text-[#E8725A]" />
        </div>
        <h3 className="font-extrabold text-[#1E2A2A]">Sara AI</h3>
        <p className="text-xs text-slate-400 mt-1">Assistente pessoal para TDAH</p>
        <p className="text-[10px] text-slate-300 mt-3 font-mono">v1.0.0</p>
      </motion.div>
    </div>
  );
};

export default Settings;
