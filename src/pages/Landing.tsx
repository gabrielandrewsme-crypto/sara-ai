import React, { useEffect, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import {
  CheckSquare, Wallet, Calendar, MessageCircle,
  Sparkles, ArrowRight, Timer, CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SaraLogo } from '@/components/SaraLogo';

// ─── Data ──────────────────────────────────────────────────────────────────

const features = [
  {
    icon: CheckSquare,
    title: 'IA Especializada em TDAH',
    description:
      'Algoritmos que compreendem a dispersão e sugerem atalhos cognitivos personalizados para o seu dia. Aprende o seu ritmo e adapta os lembretes na hora certa.',
    featured: true,
    tags: ['Personalizado', 'Adapta ao ritmo', 'Atalhos cognitivos'],
    iconColor: 'text-white',
    bgColor: '',
  },
  {
    icon: CheckSquare,
    title: 'Gestão de Tarefas',
    description:
      'Quebre tarefas complexas em mini-passos automáticos para evitar a paralisia por análise.',
    featured: false,
    iconBg: 'bg-white',
    cardBg: 'bg-[#EDE9FE]',
    iconColor: 'text-[#5C2D91]',
  },
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description:
      'Bloqueio de tempo automático baseado nos seus períodos de maior hiperfoco e energia.',
    featured: false,
    iconBg: 'bg-[#EDE9FE]',
    cardBg: 'bg-white border border-slate-100',
    iconColor: 'text-[#5C2D91]',
  },
  {
    icon: Wallet,
    title: 'Finanças 50/30/20',
    description:
      'Controle financeiro visual e simplificado para evitar gastos impulsivos e manter o orçamento em dia.',
    featured: false,
    iconBg: 'bg-[#EDE9FE]',
    cardBg: 'bg-white border border-slate-100',
    iconColor: 'text-[#E8725A]',
  },
  {
    icon: MessageCircle,
    title: 'Chat com a Sara',
    description:
      'Sua assistente 24/7 via WhatsApp ou Web. Pergunte qualquer coisa, despeje seus pensamentos.',
    featured: false,
    iconBg: 'bg-white',
    cardBg: 'bg-[#EDE9FE]',
    iconColor: 'text-[#5C2D91]',
  },
  {
    icon: Sparkles,
    title: 'Mapa Mental',
    description:
      'Visualize ideias de forma não linear. Perfeito para quem pensa em conexões rápidas e visuais.',
    featured: false,
    iconBg: 'bg-[#EDE9FE]',
    cardBg: 'bg-white border border-slate-100',
    iconColor: 'text-[#5C2D91]',
  },
];

const testimonials = [
  {
    name: 'Ana C.',
    role: 'Designer Freelance',
    text: 'A Sara mudou completamente minha forma de lidar com a rotina. O que antes era caos agora tem uma estrutura que me permite respirar.',
    color: 'bg-[#5C2D91]/20 text-[#5C2D91]',
    ring: 'ring-[#5C2D91]/30',
  },
  {
    name: 'Lucas M.',
    role: 'Desenvolvedor',
    text: 'Finalmente um app que entende como meu cérebro funciona. Não me sinto julgado pelas notificações, me sinto apoiado.',
    color: 'bg-[#E8725A]/15 text-[#E8725A]',
    ring: 'ring-[#E8725A]/30',
  },
  {
    name: 'Mariana S.',
    role: 'Advogada',
    text: 'O modo de gestão de finanças foi o único que consegui manter por mais de um mês. A interface é simplesmente maravilhosa.',
    color: 'bg-[#5C2D91]/15 text-[#5C2D91]',
    ring: 'ring-[#5C2D91]/25',
  },
];

const pricingItems = [
  'Acesso total à IA Especialista',
  'Gestor de tarefas inteligente',
  'Agenda com bloqueio de tempo',
  'Módulo financeiro 50/30/20',
  'Assistente via WhatsApp',
  'Mapa mental ilimitado',
];

// ─── Animation variants ─────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: 'easeOut' },
  }),
};

// ─── Star SVG ────────────────────────────────────────────────────────────────

const StarFilled = () => (
  <svg className="text-amber-400" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.172c.969 0 1.372 1.24.588 1.81l-3.376 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118L10 14.347l-3.374 2.454c-.784.57-1.84-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.633 9.394c-.784-.57-.38-1.81.588-1.81h4.172a1 1 0 00.95-.69l1.286-3.967z" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────────────────

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  // Nav blur on scroll
  useEffect(() => {
    return scrollY.on('change', (y) => {
      if (!navRef.current) return;
      if (y > 20) {
        navRef.current.classList.add('scrolled');
      } else {
        navRef.current.classList.remove('scrolled');
      }
    });
  }, [scrollY]);

  const handleBuy = () => {
    window.open('https://pay.cakto.com.br/6ax9ypc_790406', '_blank');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAFBFA] text-slate-900">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className="sticky top-0 z-50 border-b border-[#EDE9FE] px-6 md:px-10 py-4
                   bg-white/85 backdrop-blur-0 transition-all duration-300
                   [&.scrolled]:backdrop-blur-[16px] [&.scrolled]:shadow-[0_2px_24px_rgba(30,42,42,0.08)]"
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <SaraLogo size={36} />
            <span className="text-[#1E2A2A] text-2xl font-extrabold tracking-tight">Sara</span>
          </a>

          <div className="hidden md:flex items-center gap-10">
            {['funcionalidades', 'depoimentos', 'precos'].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-slate-500 hover:text-[#5C2D91] font-medium transition-colors capitalize"
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              className="text-slate-500 font-semibold hover:text-[#1E2A2A] px-4 transition-colors"
              onClick={() => navigate('/auth')}
            >
              Entrar
            </button>
            <button
              className="btn-shimmer bg-[#E8725A] text-white px-7 py-2.5 rounded-full font-bold
                         transition-all hover:scale-105 hover:shadow-lg hover:brightness-110"
              onClick={handleBuy}
            >
              Assinar agora
            </button>
          </div>
        </div>
      </nav >

      {/* ── Hero ───────────────────────────────────────────────────── */}
      < section className="hero-gradient relative py-20 md:py-28 px-6 md:px-10 overflow-hidden" >
        <div className="hero-dots absolute inset-0 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8725A]/10 rounded-full blur-3xl
                        pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <div className="max-w-[1440px] mx-auto relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <div className="flex flex-col items-start gap-7">
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={0}
              className="bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm
                         font-semibold flex items-center gap-2 border border-white/20"
            >
              <span className="size-2 rounded-full bg-[#E8725A] animate-[pulse-dot_2s_ease-in-out_infinite] inline-block" />
              Assistente de IA para TDAH — agora disponível
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
              className="text-white text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight"
            >
              Organize sua vida<br />com a{' '}
              <span className="text-[#E8725A]">Sara</span>
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={0.2}
              className="text-white/85 text-lg md:text-xl max-w-[520px] leading-relaxed"
            >
              Uma assistente pessoal inteligente feita sob medida para o cérebro neurodivergente.
              Simplifique sua rotina e conquiste o foco que você sempre quis.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={0.3}
              className="flex flex-wrap gap-4 pt-2"
            >
              <button
                onClick={handleBuy}
                className="btn-shimmer bg-[#E8725A] text-white text-base md:text-lg px-9 py-4
                           rounded-full font-bold flex items-center gap-2
                           hover:scale-105 hover:shadow-xl hover:shadow-[#E8725A]/40 transition-all"
              >
                Quero ter acesso <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#funcionalidades"
                className="border-2 border-white/60 text-white text-base md:text-lg px-9 py-4
                           rounded-full font-bold hover:bg-white/10 hover:border-white transition-all"
              >
                Ver funcionalidades
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={0.4}
              className="flex items-center gap-3 pt-2"
            >
              <div className="flex -space-x-2">
                {['A', 'L', 'M'].map((l, i) => (
                  <div key={l} className={`size-8 rounded-full border-2 border-white flex items-center
                    justify-center text-white text-xs font-bold
                    ${i === 0 ? 'bg-[#E8725A]/80' : i === 1 ? 'bg-white/30' : 'bg-[#2d5c53]'}`}>
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-white/80 text-sm">
                <span className="font-bold text-white">+1.200 pessoas</span> organizando sua vida com a Sara
              </p>
            </motion.div>
          </div>

          {/* Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative animate-float"
          >
            <div className="rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.3)]
                            ring-1 ring-white/10 bg-white p-2">
              <div className="rounded-xl bg-[#EDE9FE] aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-[#5C2D91]/60">
                  <SaraLogo size={96} />
                  <p className="text-sm font-semibold text-[#5C2D91]/60">Sara Dashboard Preview</p>
                </div>
              </div>
            </div>

            {/* Floating widget — focus */}
            <div className="absolute -bottom-5 -left-6 bg-white p-3.5 rounded-xl shadow-2xl
                            hidden md:flex items-center gap-3 border border-slate-100">
              <div className="size-10 rounded-full bg-[#E8725A]/10 flex items-center justify-center text-[#E8725A]">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Próximo Foco</p>
                <p className="text-[#1E2A2A] font-bold text-sm">Reunião em 15min</p>
              </div>
            </div>

            {/* Floating widget — done */}
            <div className="absolute -top-5 -right-4 bg-white p-3.5 rounded-xl shadow-2xl
                            hidden md:flex items-center gap-3 border border-slate-100">
              <div className="size-10 rounded-full bg-[#5C2D91]/10 flex items-center justify-center text-[#5C2D91]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Tarefa concluída</p>
                <p className="text-[#1E2A2A] font-bold text-sm">Relatório mensal ✅</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section >

      {/* ── Features ───────────────────────────────────────────────── */}
      < section className="bg-[#FAFBFA] py-24 px-6 md:px-10" id="funcionalidades" >
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block bg-[#EDE9FE] text-[#5C2D91] text-xs font-bold
                             uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Funcionalidades
            </span>
            <h2 className="text-[#1E2A2A] text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Tudo que você precisa,<br />em um lugar
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Desenvolvido por especialistas para transformar caos em clareza.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.08}
                className={`feature-card rounded-2xl p-8 flex flex-col gap-4
                  ${f.featured
                    ? 'lg:col-span-2 bg-gradient-to-br from-[#5C2D91] to-[#4a9088] text-white'
                    : f.cardBg ?? 'bg-[#EDE9FE]'
                  }`}
              >
                <div className={`size-14 rounded-full flex items-center justify-center shadow-sm self-start
                  ${f.featured ? 'bg-white/20' : (f.iconBg ?? 'bg-white')}`}>
                  <f.icon className={`w-7 h-7 ${f.iconColor}`} />
                </div>
                <div>
                  <h3 className={`text-xl font-extrabold mb-2 ${f.featured ? 'text-white' : 'text-[#5C2D91]'}`}>
                    {f.title}
                  </h3>
                  <p className={`leading-relaxed ${f.featured ? 'text-white/80' : 'text-slate-600'}`}>
                    {f.description}
                  </p>
                </div>
                {f.featured && f.tags && (
                  <div className="flex gap-3 mt-auto flex-wrap">
                    {f.tags.map((tag) => (
                      <span key={tag} className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* ── Testimonials ───────────────────────────────────────────── */}
      < section className="bg-white py-24 px-6 md:px-10" id="depoimentos" >
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block bg-[#EDE9FE] text-[#5C2D91] text-xs font-bold
                             uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Depoimentos
            </span>
            <h2 className="text-[#1E2A2A] text-4xl md:text-5xl font-extrabold">
              O que dizem sobre a Sara
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.15}
                className="test-card bg-[#FAFBFA] p-8 rounded-2xl flex flex-col gap-5"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => <StarFilled key={j} />)}
                </div>
                <p className="text-slate-700 italic text-lg leading-relaxed relative z-10">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className={`size-11 rounded-full flex items-center justify-center font-bold
                                  ring-2 ring-offset-2 ${t.color} ${t.ring}`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[#1E2A2A]">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* ── Pricing ────────────────────────────────────────────────── */}
      < section className="bg-[#EDE9FE] py-28 px-6 md:px-10" id="precos" >
        <div className="max-w-[1440px] mx-auto flex flex-col items-center">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block bg-white text-[#5C2D91] text-xs font-bold
                             uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 shadow-sm">
              Preços
            </span>
            <h2 className="text-[#1E2A2A] text-4xl md:text-5xl font-extrabold mb-3">
              Um plano, tudo incluso
            </h2>
            <p className="text-slate-500 text-lg">Cancele quando quiser. Sem fidelidade, sem letras miúdas.</p>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.1}
            className="flex items-center gap-4 mb-12"
          >
            <div className="flex -space-x-2">
              {['A', 'L', 'M', '+'].map((l, i) => (
                <div key={l} className={`size-8 rounded-full border-2 border-white flex items-center
                  justify-center text-white text-xs font-bold
                  ${i === 0 ? 'bg-[#E8725A]/80' : i === 1 ? 'bg-[#5C2D91]' : i === 2 ? 'bg-[#1E2A2A]' : 'bg-slate-400'}`}>
                  {l}
                </div>
              ))}
            </div>
            <p className="text-slate-600 text-sm font-medium">
              <span className="font-bold text-[#1E2A2A]">1.247 assinantes</span> ativos este mês
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.2}
            className="animate-[glow-pulse_3s_ease-in-out_infinite] bg-white w-full max-w-[460px]
                       rounded-3xl p-12 relative"
          >
            <div className="badge-shimmer absolute -top-4 left-1/2 -translate-x-1/2
                            text-white px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-md">
              Mais popular
            </div>

            <div className="text-center mb-10">
              <h3 className="text-[#1E2A2A] text-xl font-bold mb-3">Plano Sara</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-slate-400 text-lg font-medium">R$</span>
                <span className="text-5xl font-extrabold text-[#1E2A2A]">49</span>
                <span className="text-2xl font-extrabold text-[#1E2A2A]">,90</span>
                <span className="text-slate-400 ml-1">/mês</span>
              </div>
              <p className="text-slate-400 text-sm mt-2">ou R$ 479/ano (economize 20%)</p>
            </div>

            <ul className="space-y-4 mb-10">
              {pricingItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700">
                  <div className="size-6 rounded-full bg-[#E8725A]/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#E8725A]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={handleBuy}
              className="btn-shimmer w-full bg-[#E8725A] hover:brightness-110 text-white py-5
                         rounded-full font-extrabold text-lg transition-all flex items-center
                         justify-center gap-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#E8725A]/30"
            >
              Assinar agora <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-slate-400 text-sm mt-5">
              Cancele quando quiser. Sem fidelidade.
            </p>
          </motion.div>
        </div>
      </section >

      {/* ── Footer ─────────────────────────────────────────────────── */}
      < footer className="bg-[#1E2A2A] py-16 px-6 md:px-10 text-white" >
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="size-9 flex items-center justify-center">
                  <SaraLogo size={36} />
                </div>
                <span className="text-white text-xl font-extrabold">Sara</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-[240px]">
                Transformando a vida de pessoas com TDAH através da inteligência artificial.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-white font-bold mb-2">Produto</p>
              {['funcionalidades', 'depoimentos', 'precos'].map((id) => (
                <a key={id} href={`#${id}`}
                  className="text-slate-400 hover:text-white transition-colors text-sm capitalize">
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-white font-bold mb-2">Legal</p>
              {['Privacidade', 'Termos de Uso', 'Contato'].map((l) => (
                <a key={l} href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  {l}
                </a>
              ))}
            </div>
          </div>

          <p className="text-slate-500 text-sm text-center pt-8">
            © {new Date().getFullYear()} Sara AI. Todos os direitos reservados.
          </p>
        </div>
      </footer >
    </div >
  );
};

export default Landing;
