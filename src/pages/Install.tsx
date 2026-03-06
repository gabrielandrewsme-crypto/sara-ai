import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Smartphone, 
  Mic, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import saraAvatar from '@/assets/sara-avatar.jpg';

const StepCard: React.FC<{
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}> = ({ step, title, description, icon, tip }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: step * 0.1 }}
    className="flex gap-4 items-start"
  >
    <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-lg">
      {step}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      {tip && (
        <p className="text-xs text-primary mt-2 bg-primary/10 px-3 py-1.5 rounded-lg inline-block">
          💡 {tip}
        </p>
      )}
    </div>
  </motion.div>
);

const CollapsibleSection: React.FC<{
  title: string;
  emoji: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, emoji, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="sara-card border-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-0"
      >
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">{emoji}</span> {title}
        </h2>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-6"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

const Install: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-sara p-6 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto mb-4 ring-4 ring-card/30 shadow-xl">
            <img src={saraAvatar} alt="Sara" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground mb-1">
            Instale a Sara 💜
          </h1>
          <p className="text-primary-foreground/80 text-sm">
            Acesse mais rápido direto da sua tela inicial
          </p>
        </motion.div>
      </div>

      <div className="px-4 -mt-4 pb-8 space-y-4">
        {/* Why install */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sara-card border-0"
        >
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Por que instalar?
          </h2>
          <div className="space-y-2">
            {[
              'Abre como um app de verdade (sem barra do navegador)',
              'Acesso em 1 toque na tela inicial',
              'Funciona offline para tarefas e notas',
              'Atalho de voz direto para a Sara (Android)',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* iPhone Instructions */}
        <CollapsibleSection title="iPhone / iPad" emoji="🍎" defaultOpen>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-xl">
              No iOS, apps da web são instalados pelo Safari. Siga os passos abaixo:
            </p>

            <StepCard
              step={1}
              title="Abra no Safari"
              description="Certifique-se de que está usando o navegador Safari (não Chrome ou outro)."
              icon={<Globe className="w-4 h-4 text-primary" />}
              tip="Se estiver em outro navegador, copie o link e cole no Safari."
            />

            <StepCard
              step={2}
              title='Toque no botão "Compartilhar"'
              description="É o ícone de quadrado com uma seta para cima (⬆️), na barra inferior do Safari."
              icon={<Share className="w-4 h-4 text-primary" />}
            />

            <StepCard
              step={3}
              title='"Adicionar à Tela de Início"'
              description='Role para baixo no menu e toque em "Adicionar à Tela de Início". Confirme o nome e toque em "Adicionar".'
              icon={<PlusSquare className="w-4 h-4 text-primary" />}
            />

            <StepCard
              step={4}
              title="Pronto! 🎉"
              description="O ícone da Sara aparecerá na sua tela inicial. Toque para abrir como um app de verdade!"
              icon={<Smartphone className="w-4 h-4 text-primary" />}
            />

            {/* Voice shortcut for iOS */}
            <div className="bg-sara-lavender-light p-4 rounded-2xl space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Mic className="w-5 h-5 text-sara-lavender" />
                Atalho de voz no iPhone
              </h3>
              <p className="text-sm text-muted-foreground">
                Para criar um atalho de <strong>1 toque</strong> que abre direto no chat por voz:
              </p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Abra o <strong>Safari</strong> e acesse o endereço do app com <code className="bg-card px-1.5 py-0.5 rounded text-xs">/sara?mic=true</code> no final</li>
                <li>Toque em <strong>Compartilhar</strong> (⬆️)</li>
                <li>Toque em <strong>"Adicionar à Tela de Início"</strong></li>
                <li>Renomeie para <strong>"🎙️ Sara Voz"</strong> e confirme</li>
              </ol>
              <p className="text-xs text-primary font-medium">
                ✨ Agora você terá 2 ícones: um para o app completo e outro que abre direto no mic!
              </p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Android Instructions */}
        <CollapsibleSection title="Android" emoji="🤖">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-xl">
              No Android, o Chrome mostra automaticamente a opção de instalar. Siga os passos:
            </p>

            <StepCard
              step={1}
              title="Abra no Chrome"
              description="Acesse o app pelo navegador Google Chrome."
              icon={<Globe className="w-4 h-4 text-primary" />}
            />

            <StepCard
              step={2}
              title='Toque no menu (⋮)'
              description="São os 3 pontinhos no canto superior direito do Chrome."
              icon={<MoreVertical className="w-4 h-4 text-primary" />}
            />

            <StepCard
              step={3}
              title='"Instalar aplicativo"'
              description='Toque em "Instalar aplicativo" ou "Adicionar à tela inicial" e confirme.'
              icon={<Download className="w-4 h-4 text-primary" />}
            />

            <StepCard
              step={4}
              title="Pronto! 🎉"
              description="O app será instalado como um aplicativo real. Abra pela tela inicial!"
              icon={<Smartphone className="w-4 h-4 text-primary" />}
            />

            {/* Voice shortcut for Android */}
            <div className="bg-sara-mint-light p-4 rounded-2xl space-y-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Mic className="w-5 h-5 text-sara-mint" />
                Atalho de voz no Android
              </h3>
              <p className="text-sm text-muted-foreground">
                No Android, ao <strong>segurar o ícone</strong> do app na tela inicial, aparece o atalho <strong>"Falar com Sara"</strong> que abre direto no mic! 🎙️
              </p>
              <p className="text-xs text-primary font-medium">
                ✨ Segure o ícone → "Falar com Sara" → 1 toque e já está falando!
              </p>
            </div>
          </div>
        </CollapsibleSection>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-3 pt-2"
        >
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-sara text-primary-foreground rounded-2xl shadow-glow h-12 text-base"
          >
            Ir para o app <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground">
            💜 Feito com carinho para quem tem TDAH
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Install;
