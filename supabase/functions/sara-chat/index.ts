import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SARA_SYSTEM_PROMPT = `Você é a Sara Ortiz, uma influenciadora digital de IA especializada em TDAH. Você tem uma conta no Instagram @saraortiz.ai onde cria conteúdos sobre TDAH com vídeos auto-explicativos como pequenos filmes.

CONTEXTO DO APP (MUITO IMPORTANTE):
Eu te desenvolvi como parte de um sistema. Você faz parte de um app chamado Sara Ortiz, uma assistente virtual para apoio TDAH. No app existem as seguintes funcionalidades:
- Agenda/Calendário (eventos com data, horário e local)
- Lembretes (tarefas pontuais com data/hora opcional)
- Rotina (itens diários recorrentes que se repetem todo dia)
- Diário (entradas com humor e reflexões do dia)
- Anotações (notas livres com título e conteúdo)
- Ideias em Mapa Mental
- Finanças (receitas e despesas)
- Chat (você! A Sara)

Tudo está integrado dentro do app. Você auxilia com bons conselhos e rico material sobre TDAH, e finanças no método 50/30/20. 

REGRA CRÍTICA: Tudo o que pedirem a você adicionar - seja rotina, agenda, lembrete, diário, anotações - você DEVE usar as ferramentas (tools) disponíveis para adicionar DIRETAMENTE no app. NUNCA sugira usar agendas externas, Google Calendar, ou qualquer outro app. Você FAZ PARTE do app e adiciona tudo internamente. Quando você usa uma ferramenta, o item é criado automaticamente dentro do app. Confirme que foi adicionado no app e indique em qual aba o usuário pode encontrar o item.

PERSONALIDADE:
- Você é animada, acolhedora, empática e usa emojis com moderação (💜 ✨ 🌟 😊)
- Fala de forma natural e amigável, como uma amiga próxima
- Sempre menciona seus conteúdos e vídeos quando relevante
- É conselheira e motivacional, ajudando pessoas com TDAH a se organizarem

REGRAS IMPORTANTES - SIGA SEMPRE:
1. NUNCA dê conselhos médicos ou instruções que possam prejudicar a saúde
2. SEMPRE recomende procurar um profissional de saúde (médico, psicólogo, psiquiatra) para questões de saúde, medicamentos, diagnósticos
3. Você pode dar dicas de organização, produtividade, rotina e bem-estar geral
4. Se perguntarem sobre medicamentos, tratamentos ou sintomas graves, diga gentilmente que isso deve ser discutido com um profissional
5. Mantenha as respostas concisas (máximo 3-4 parágrafos)

TEMAS QUE VOCÊ DOMINA:
- Organização e produtividade para pessoas com TDAH
- Técnicas de foco e concentração
- Gestão de tempo e tarefas
- Bem-estar emocional e autocuidado
- Motivação e autoestima
- Dicas práticas do dia a dia

CAPACIDADES ESPECIAIS - USE AS FERRAMENTAS CORRETAS:
Você DEVE usar as ferramentas disponíveis quando o usuário pedir para criar/adicionar algo. Escolha a ferramenta certa:

- add_routine: Para itens de ROTINA DIÁRIA que se repetem todo dia (ex: "tomar remédio às 8h", "meditar", "beber água"). Esses itens aparecem na aba Rotina.
- add_reminder: Para LEMBRETES pontuais com data/hora específica (ex: "lembrar de ligar pro médico amanhã", "comprar presente sexta"). Aparecem na aba Lembretes.
- add_event: Para EVENTOS/COMPROMISSOS com horário definido (ex: "reunião às 14h", "consulta dia 10 às 10h", "aniversário"). Aparecem no Calendário/Agenda.
- add_task: Use APENAS se o contexto não se encaixar em rotina, lembrete ou evento.
- add_transaction: Para registrar FINANÇAS (gastos, receitas, salário, compras, contas). Aparece em Finanças.
- add_note: Para criar ANOTAÇÕES/notas livres. Aparece em Anotações.
- add_diary_entry: Para registrar no DIÁRIO do usuário. Aparece no Diário.

COMO DISTINGUIR:
- "Adicionar escovar os dentes na minha rotina" → add_routine (é diário/recorrente)
- "Me lembra de ir ao banco amanhã" → add_reminder (é pontual)
- "Tenho consulta dia 15 às 10h" → add_event (é um compromisso com data/hora)
- "Gastei 50 reais no mercado" → add_transaction (é financeiro)
- "Anota que preciso pesquisar sobre X" → add_note (é uma anotação)
- "Hoje me senti bem, fiz exercício" → add_diary_entry (é reflexão do dia)

Ao criar itens:
- Extraia as informações do contexto da conversa
- Se a data não for especificada, use a data de hoje
- Se o horário não for especificado, pergunte ou use um horário razoável
- Para transações, identifique se é receita (income) ou despesa (expense) pelo contexto
- SEMPRE confirme o que foi criado e diga em qual aba do app o usuário pode ver

EDUCAÇÃO FINANCEIRA - REGRA 50/30/20:
Você é especialista em educação financeira e usa o método 50/30/20:
- 50% da renda para NECESSIDADES (Moradia, Alimentação, Transporte, Saúde)
- 30% da renda para DESEJOS (Lazer, Educação pessoal não essencial, Compras supérfluas)
- 20% da renda para POUPANÇA/INVESTIMENTOS

Quando o usuário compartilhar informações financeiras ou pedir dicas:
- Analise se os gastos estão equilibrados conforme a regra 50/30/20
- Alerte de forma gentil sobre gastos desnecessários ou supérfluos
- Sugira onde economizar se os desejos estiverem acima de 30%
- Incentive a poupar/investir se estiver abaixo de 20%
- Use exemplos práticos e linguagem acessível
- Celebre conquistas financeiras do usuário

Lembre-se: você é uma amiga virtual que entende as dificuldades do TDAH e está ali para apoiar, não para substituir profissionais de saúde.`;

const tools = [
  {
    type: "function",
    function: {
      name: "add_routine",
      description: "Adiciona um item à ROTINA DIÁRIA do usuário. Use para atividades recorrentes que se repetem todo dia (ex: tomar remédio, meditar, exercício, beber água). O item aparece na aba 'Rotina' do app.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título do item de rotina (obrigatório)" },
          time: { type: "string", description: "Horário no formato HH:MM (24h). Se não especificado, use 08:00." }
        },
        required: ["title"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_reminder",
      description: "Adiciona um LEMBRETE pontual para o usuário. Use para tarefas específicas com data/hora (ex: ligar pro médico, comprar presente, pagar conta). O item aparece na aba 'Lembretes' do app.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título do lembrete (obrigatório)" },
          description: { type: "string", description: "Descrição adicional do lembrete" },
          date: { type: "string", description: "Data no formato YYYY-MM-DD. Se não especificada, use a data atual." },
          time: { type: "string", description: "Horário no formato HH:MM (24h). Opcional." }
        },
        required: ["title"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_event",
      description: "Adiciona um EVENTO/COMPROMISSO ao calendário do app. Use para reuniões, consultas, aniversários, compromissos com horário definido. O item aparece no 'Calendário' do app.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título do evento (obrigatório)" },
          description: { type: "string", description: "Descrição adicional do evento" },
          date: { type: "string", description: "Data no formato YYYY-MM-DD. Se não especificada, use a data atual." },
          startTime: { type: "string", description: "Horário de início no formato HH:MM (24h). Obrigatório." },
          endTime: { type: "string", description: "Horário de término no formato HH:MM (24h). Se não especificado, adicione 1 hora ao startTime." },
          location: { type: "string", description: "Local do evento" },
          color: { type: "string", description: "Cor do evento (ex: #4F9DA6 para teal, #FF6B6B para coral). Use #4F9DA6 como padrão." }
        },
        required: ["title", "startTime"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_task",
      description: "Adiciona uma tarefa genérica. Prefira usar add_routine para itens diários, add_reminder para lembretes pontuais, ou add_event para compromissos. Use add_task apenas quando não se encaixar nos outros.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título da tarefa (obrigatório)" },
          description: { type: "string", description: "Descrição adicional da tarefa" },
          date: { type: "string", description: "Data no formato YYYY-MM-DD." },
          time: { type: "string", description: "Horário no formato HH:MM (24h). Se não especificado, use 09:00." },
          priority: { type: "string", enum: ["low", "medium", "high"], description: "Prioridade da tarefa." },
          category: { type: "string", description: "Categoria da tarefa (ex: Trabalho, Saúde, Pessoal)" }
        },
        required: ["title"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_transaction",
      description: "Adiciona uma transação financeira (receita ou despesa) no app. Use quando o usuário mencionar gastos, compras, contas, salário, dinheiro recebido. O item aparece em 'Finanças' do app.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["income", "expense"], description: "Tipo: 'income' para receitas ou 'expense' para despesas" },
          amount: { type: "number", description: "Valor em reais (apenas número)" },
          description: { type: "string", description: "Descrição da transação" },
          category: { type: "string", description: "Categoria: Alimentação, Moradia, Transporte, Saúde, Lazer, Educação, Salário, Freelance, Outros" },
          date: { type: "string", description: "Data no formato YYYY-MM-DD." }
        },
        required: ["type", "amount", "description"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_note",
      description: "Cria uma ANOTAÇÃO/nota no app. Use quando o usuário pedir para anotar algo, salvar uma informação, ou criar uma nota. O item aparece em 'Anotações' do app.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título da anotação (obrigatório)" },
          content: { type: "string", description: "Conteúdo da anotação (obrigatório)" },
          color: { type: "string", description: "Cor da nota (ex: #4F9DA6, #FF6B6B, #6C63FF). Opcional." }
        },
        required: ["title", "content"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_diary_entry",
      description: "Registra uma entrada no DIÁRIO do usuário. Use quando o usuário quiser registrar como se sentiu, reflexões do dia, ou quando contar sobre seu dia. O item aparece no 'Diário' do app.",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string", description: "Conteúdo/reflexão do dia (obrigatório)" },
          mood: { type: "string", enum: ["great", "good", "neutral", "bad", "awful"], description: "Humor: great, good, neutral, bad, awful. Deduza do contexto." },
          highlights: { type: "string", description: "Destaques do dia" },
          date: { type: "string", description: "Data no formato YYYY-MM-DD." }
        },
        required: ["content", "mood"],
        additionalProperties: false
      }
    }
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userName, currentDate, financialContext } = await req.json();
    console.log("Sara Chat - Received request with messages:", messages?.length);
    
    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GOOGLE_GEMINI_API_KEY) {
      console.error("GOOGLE_GEMINI_API_KEY is not configured");
      throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
    }

    let systemPrompt = SARA_SYSTEM_PROMPT;
    if (userName) {
      systemPrompt += `\n\nO nome do usuário é ${userName}. Use o nome dele ocasionalmente para tornar a conversa mais pessoal.`;
    }
    if (currentDate) {
      systemPrompt += `\n\nA data atual é ${currentDate}. Use esta data como referência para "hoje", "amanhã", etc.`;
    }
    
    if (financialContext) {
      const { totalIncome, totalExpenses, balance, expensesByCategory, expenseRatio } = financialContext;
      const needsCategories = ['Moradia', 'Alimentação', 'Transporte', 'Saúde'];
      const wantsCategories = ['Lazer', 'Educação', 'Outros'];
      let needsTotal = 0;
      let wantsTotal = 0;
      Object.entries(expensesByCategory).forEach(([category, amount]) => {
        if (needsCategories.includes(category)) needsTotal += amount as number;
        if (wantsCategories.includes(category)) wantsTotal += amount as number;
      });
      const needsPercent = totalIncome > 0 ? Math.round((needsTotal / totalIncome) * 100) : 0;
      const wantsPercent = totalIncome > 0 ? Math.round((wantsTotal / totalIncome) * 100) : 0;
      
      systemPrompt += `\n\nCONTEXTO FINANCEIRO DO USUÁRIO:
- Renda total: R$ ${totalIncome.toLocaleString('pt-BR')}
- Gastos totais: R$ ${totalExpenses.toLocaleString('pt-BR')} (${expenseRatio}% da renda)
- Saldo: R$ ${balance.toLocaleString('pt-BR')}
ANÁLISE 50/30/20:
- Necessidades (50%): ${needsPercent}% (${needsPercent > 50 ? 'ACIMA ⚠️' : 'OK ✅'})
- Desejos (30%): ${wantsPercent}% (${wantsPercent > 30 ? 'ACIMA ⚠️' : 'OK ✅'})
Gastos por categoria: ${Object.entries(expensesByCategory).map(([cat, val]) => `${cat}: R$ ${(val as number).toLocaleString('pt-BR')}`).join(', ')}`;
    }

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOOGLE_GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools: tools,
        tool_choice: "auto",
        stream: true,
      }),
    });

    console.log("Sara Chat - AI Gateway response status:", response.status);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas mensagens! Aguarde um momento e tente novamente. 💜" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Por favor, adicione créditos." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Ops, algo deu errado. Tente novamente! 😅" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Sara Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
