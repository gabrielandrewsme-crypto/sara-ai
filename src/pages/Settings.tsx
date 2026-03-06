import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Moon, Sun, Bell, BellOff, ChevronRight, Shield, Heart, LogOut, BellRing, Smartphone } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

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
    }
  };

  const toggleNotification = (key: keyof typeof user.notifications) => {
    setUser({
      ...user,
      notifications: {
        ...user.notifications,
        [key]: !user.notifications[key],
      },
    });
  };

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      toast.success('Notificações ativadas! 🔔', {
        description: 'Você receberá lembretes da rotina e agenda.',
      });
    } else if (result === 'denied') {
      toast.error('Notificações bloqueadas', {
        description: 'Acesse as configurações do navegador para permitir notificações.',
      });
    }
  };

  return (
    <div className="py-4 space-y-6">
      {/* Profile Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="sara-section-title">Perfil</h2>
        <Dialog open={isNameOpen} onOpenChange={setIsNameOpen}>
          <DialogTrigger asChild>
            <button className="sara-card w-full flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-sara rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">Toque para editar</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Nome</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Seu nome</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Como você quer ser chamado?"
                  className="sara-input"
                />
              </div>
              <Button onClick={handleNameSave} className="w-full bg-gradient-sara">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.section>

      {/* Appearance */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="sara-section-title">Aparência</h2>
        <button
          onClick={toggleTheme}
          className="sara-card w-full flex items-center gap-3"
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            theme === 'dark' ? 'bg-sara-lavender-light' : 'bg-sara-gold-light'
          }`}>
            {theme === 'dark' ? (
              <Moon className="w-6 h-6 text-sara-lavender" />
            ) : (
              <Sun className="w-6 h-6 text-sara-gold" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">
              Tema {theme === 'dark' ? 'Escuro' : 'Claro'}
            </p>
            <p className="text-sm text-muted-foreground">
              Toque para alternar
            </p>
          </div>
          <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
            theme === 'dark' ? 'bg-primary' : 'bg-secondary'
          }`}>
            <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${
              theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </div>
        </button>
      </motion.section>

      {/* Notification Permission */}
      {isSupported && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="sara-section-title">Permissão de Notificações</h2>
          <div className="sara-card">
            {permission === 'granted' ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sara-mint-light rounded-2xl flex items-center justify-center">
                  <BellRing className="w-6 h-6 text-sara-mint" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Notificações ativas ✅</p>
                  <p className="text-sm text-muted-foreground">
                    Você receberá alertas da rotina, lembretes e agenda.
                  </p>
                </div>
              </div>
            ) : permission === 'denied' ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sara-coral-light rounded-2xl flex items-center justify-center">
                  <BellOff className="w-6 h-6 text-sara-coral" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Notificações bloqueadas</p>
                  <p className="text-sm text-muted-foreground">
                    Acesse as configurações do seu navegador/dispositivo e permita notificações para este site.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sara-gold-light rounded-2xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-sara-gold" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Ativar notificações</p>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes da rotina e agenda no seu celular.
                  </p>
                </div>
                <Button onClick={handleEnableNotifications} className="bg-gradient-sara text-sm">
                  Ativar
                </Button>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Notifications Toggle */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="sara-section-title">Tipos de Notificação</h2>
        <div className="space-y-3">
          <div className="sara-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sara-teal-light rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Rotina</p>
                <p className="text-xs text-muted-foreground">Tarefas diárias e lembretes</p>
              </div>
            </div>
            <Switch
              checked={user.notifications.tasks}
              onCheckedChange={() => toggleNotification('tasks')}
            />
          </div>

          <div className="sara-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sara-coral-light rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-sara-coral" />
              </div>
              <div>
                <p className="font-medium text-foreground">Eventos</p>
                <p className="text-xs text-muted-foreground">Alertas da agenda</p>
              </div>
            </div>
            <Switch
              checked={user.notifications.events}
              onCheckedChange={() => toggleNotification('events')}
            />
          </div>

          <div className="sara-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sara-mint-light rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-sara-mint" />
              </div>
              <div>
                <p className="font-medium text-foreground">Finanças</p>
                <p className="text-xs text-muted-foreground">Alertas de gastos</p>
              </div>
            </div>
            <Switch
              checked={user.notifications.financial}
              onCheckedChange={() => toggleNotification('financial')}
            />
          </div>
        </div>
      </motion.section>

      {/* Admin */}
      {isAdmin && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="sara-section-title">Administração</h2>
          <button
            onClick={() => navigate('/admin/clients')}
            className="sara-card w-full flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Painel Admin</p>
              <p className="text-sm text-muted-foreground">Gerenciar clientes e assinaturas</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.section>
      )}

      {/* Install App */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
      >
        <button
          onClick={() => navigate('/install')}
          className="sara-card w-full flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-sara-lavender-light rounded-2xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-sara-lavender" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">Instalar no celular</p>
            <p className="text-sm text-muted-foreground">Instruções para iPhone e Android</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </motion.section>

      {/* Logout */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Button
          variant="outline"
          className="w-full rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sair da conta
        </Button>
      </motion.section>

      {/* About */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="sara-section-title">Sobre</h2>
        <div className="sara-card text-center">
          <div className="w-16 h-16 bg-gradient-sara rounded-3xl flex items-center justify-center mx-auto mb-3">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="font-bold text-foreground">Sara</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Assistente pessoal para TDAH
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Versão 1.0.0
          </p>
        </div>
      </motion.section>
    </div>
  );
};

export default Settings;
