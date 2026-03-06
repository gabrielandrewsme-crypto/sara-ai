import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserCheck, UserX, RefreshCw, Mail, Calendar, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ClientRow {
  user_id: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  subscription_status: string | null;
  subscription_plan: string | null;
  kiwify_email: string | null;
  audio_seconds_used: number;
}

const AdminClients: React.FC = () => {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchClients = async () => {
    setLoading(true);
    // Fetch profiles with latest subscription info
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      setLoading(false);
      return;
    }

    // Fetch subscriptions and audio usage in parallel
    const monthYear = new Date().toISOString().slice(0, 7);
    const [{ data: subs }, { data: audioUsage }] = await Promise.all([
      supabase.from('subscriptions').select('user_id, status, plan, kiwify_email'),
      supabase.from('audio_usage').select('user_id, seconds_used').eq('month_year', monthYear),
    ]);

    const subsMap = new Map<string, { status: string; plan: string; kiwify_email: string | null }>();
    subs?.forEach((s: any) => subsMap.set(s.user_id, { status: s.status, plan: s.plan, kiwify_email: s.kiwify_email }));

    const audioMap = new Map<string, number>();
    audioUsage?.forEach((a: any) => audioMap.set(a.user_id, a.seconds_used));

    const merged: ClientRow[] = (profiles || []).map((p: any) => {
      const sub = subsMap.get(p.user_id);
      return {
        user_id: p.user_id,
        full_name: p.full_name,
        is_active: p.is_active,
        created_at: p.created_at,
        subscription_status: sub?.status ?? null,
        subscription_plan: sub?.plan ?? null,
        kiwify_email: sub?.kiwify_email ?? null,
        audio_seconds_used: audioMap.get(p.user_id) ?? 0,
      };
    });

    setClients(merged);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const toggleAccess = async (userId: string, currentActive: boolean) => {
    setToggling(userId);
    const newActive = !currentActive;

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: newActive })
      .eq('user_id', userId);

    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível alterar o acesso.', variant: 'destructive' });
    } else {
      toast({ title: newActive ? 'Acesso ativado ✅' : 'Acesso desativado ❌' });
      setClients(prev => prev.map(c => c.user_id === userId ? { ...c, is_active: newActive } : c));
    }
    setToggling(null);
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.full_name?.toLowerCase().includes(q)) ||
      (c.kiwify_email?.toLowerCase().includes(q)) ||
      c.user_id.toLowerCase().includes(q)
    );
  });

  const activeCount = clients.filter(c => c.is_active).length;

  return (
    <div className="py-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="sara-card border-0">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{clients.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="sara-card border-0">
            <CardContent className="p-4 text-center">
              <UserCheck className="w-6 h-6 text-sara-mint mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchClients}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Client list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum cliente encontrado.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((client) => (
              <Card key={client.user_id} className="sara-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground truncate">
                          {client.full_name || 'Sem nome'}
                        </p>
                        <Badge variant={client.is_active ? 'default' : 'secondary'} className={client.is_active ? 'bg-sara-mint text-primary-foreground' : ''}>
                          {client.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      {client.kiwify_email && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {client.kiwify_email}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(client.created_at).toLocaleDateString('pt-BR')}
                        {client.subscription_status && (
                          <> · Assinatura: {client.subscription_status}</>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Mic className="w-3 h-3" />
                        Áudio: {Math.floor(client.audio_seconds_used / 60)}min / 60min
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={client.is_active ? 'destructive' : 'default'}
                      className={!client.is_active ? 'bg-gradient-sara text-primary-foreground' : ''}
                      disabled={toggling === client.user_id}
                      onClick={() => toggleAccess(client.user_id, client.is_active)}
                    >
                      {client.is_active ? (
                        <><UserX className="w-4 h-4 mr-1" /> Desativar</>
                      ) : (
                        <><UserCheck className="w-4 h-4 mr-1" /> Ativar</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminClients;
