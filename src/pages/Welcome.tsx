import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Smartphone, UserPlus, Download, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import saraLogo from '@/assets/sara-logo.jpeg';

const steps = [
  {
    icon: UserPlus,
    title: '1. Crie sua conta',
    description: 'Use o MESMO email que você usou na compra para criar sua conta no app.',
    color: 'bg-sara-lavender-light text-sara-lavender',
  },
  {
    icon: Smartphone,
    title: '2. Instale no celular',
    description: 'No navegador do celular, toque em "Compartilhar" (iPhone) ou no menu ⋮ (Android) e selecione "Adicionar à tela inicial".',
    color: 'bg-sara-teal-light text-primary',
  },
  {
    icon: Download,
    title: '3. Pronto!',
    description: 'O app vai aparecer na sua tela inicial como qualquer outro app. Abra e faça login!',
    color: 'bg-sara-mint-light text-sara-mint',
  },
];

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sara-lavender-light via-background to-sara-mint-light p-4">
      <div className="max-w-lg mx-auto pt-8 pb-16">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 shadow-lg overflow-hidden">
            <img src={saraLogo} alt="Sara logo" className="w-full h-full object-cover" />
          </div>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            Pagamento confirmado!
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Bem-vinda à <span className="gradient-text">Sara</span>! 🎉
          </h1>
          <p className="text-muted-foreground text-lg">
            Sua assinatura foi ativada com sucesso. Siga os passos abaixo para começar a usar.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.15 }}
            >
              <Card className="sara-card border-0 shadow-md">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Important note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-2 border-primary/20 bg-primary/5 mb-8">
            <CardContent className="p-5">
              <p className="text-sm text-foreground">
                <strong>⚠️ Importante:</strong> Use o <strong>mesmo email</strong> da compra ao criar sua conta. 
                Caso contrário, seu acesso não será liberado automaticamente.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-3"
        >
          <Button 
            size="lg" 
            className="w-full bg-gradient-sara text-primary-foreground text-lg py-6 rounded-2xl shadow-glow"
            onClick={() => navigate('/auth')}
          >
            Criar minha conta <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="w-full text-lg py-6 rounded-2xl"
            onClick={() => navigate('/auth')}
          >
            Já tenho conta — Fazer login
          </Button>
          <Button 
            size="lg" 
            variant="ghost"
            className="w-full text-base py-5 rounded-2xl text-primary"
            onClick={() => navigate('/install')}
          >
            <Smartphone className="w-5 h-5 mr-2" /> Como instalar no celular?
          </Button>
        </motion.div>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Dúvidas? Fale com a gente no{' '}
          <a 
            href="https://www.instagram.com/saraortiz.ai?igsh=MWhuMXNhMGszY3lsZQ==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            Instagram <ExternalLink className="w-3 h-3" />
          </a>
        </motion.p>
      </div>
    </div>
  );
};

export default Welcome;
