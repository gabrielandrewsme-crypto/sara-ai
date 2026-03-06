import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Send, Mic, MicOff, Trash2, CheckCircle2, Calendar, DollarSign, X } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import saraAvatar from '@/assets/sara-avatar.jpg';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sara-chat`;

interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface ActionExecuted {
  type: 'task' | 'event' | 'transaction' | 'routine' | 'reminder' | 'note' | 'diary';
  title: string;
  transactionType?: 'income' | 'expense';
}

export const SaraChat: React.FC = () => {
  const { chatMessages, addChatMessage, clearChat, user, addTask, addEvent, addTransaction, transactions, addRoutineItem, addReminder, addNote, addDiaryEntry } = useSara();
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [actionsExecuted, setActionsExecuted] = useState<ActionExecuted[]>([]);
  const [showPhoto, setShowPhoto] = useState(false);
  const autoMicTriggered = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleVoiceResult = useCallback((transcript: string) => {
    setInput(prev => prev ? `${prev} ${transcript}` : transcript);
  }, []);

  const handleVoiceError = useCallback((error: string) => {
    toast({
      title: 'Microfone',
      description: error,
      variant: 'destructive',
    });
  }, [toast]);

  const handleLimitReached = useCallback(() => {
    toast({
      title: '⏱️ Limite de áudio atingido',
      description: 'Você usou 1 hora de áudio este mês. O limite renova no próximo mês.',
      variant: 'destructive',
    });
  }, [toast]);

  const { 
    isRecording: isListening, 
    isTranscribing,
    toggleRecording: toggleListening,
    secondsUsed,
    secondsLimit,
  } = useAudioRecorder({
    onTranscript: handleVoiceResult,
    onError: handleVoiceError,
    onLimitReached: handleLimitReached,
  });

  const audioLimitReached = secondsUsed !== null && secondsUsed >= secondsLimit;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, actionsExecuted]);

  // Auto-start mic when ?mic=true
  useEffect(() => {
    if (searchParams.get('mic') === 'true' && !autoMicTriggered.current && !audioLimitReached) {
      autoMicTriggered.current = true;
      // Remove param so it doesn't re-trigger
      searchParams.delete('mic');
      setSearchParams(searchParams, { replace: true });
      // Small delay to ensure component is fully mounted
      setTimeout(() => toggleListening(), 500);
    }
  }, [searchParams, setSearchParams, toggleListening, audioLimitReached]);

  const executeToolCall = (toolCall: ToolCall) => {
    try {
      const args = JSON.parse(toolCall.function.arguments);
      const today = new Date().toISOString().split('T')[0];
      
      if (toolCall.function.name === 'add_routine') {
        const item = {
          title: args.title,
          time: args.time || '08:00',
          completed: false,
        };
        addRoutineItem(item);
        setActionsExecuted(prev => [...prev, { type: 'routine', title: item.title }]);
        toast({ title: '🔄 Rotina criada!', description: item.title });
      } else if (toolCall.function.name === 'add_reminder') {
        const reminder = {
          title: args.title,
          description: args.description || '',
          date: args.date || today,
          time: args.time || undefined,
          completed: false,
        };
        addReminder(reminder);
        setActionsExecuted(prev => [...prev, { type: 'reminder', title: reminder.title }]);
        toast({ title: '🔔 Lembrete criado!', description: reminder.title });
      } else if (toolCall.function.name === 'add_task') {
        const task = {
          title: args.title,
          description: args.description || '',
          date: args.date || today,
          time: args.time || '09:00',
          completed: false,
          priority: args.priority || 'medium',
          category: args.category || 'Geral',
        };
        addTask(task);
        setActionsExecuted(prev => [...prev, { type: 'task', title: task.title }]);
        toast({ title: '✅ Tarefa criada!', description: task.title });
      } else if (toolCall.function.name === 'add_event') {
        const event = {
          title: args.title,
          description: args.description || '',
          date: args.date || today,
          startTime: args.startTime,
          endTime: args.endTime || calculateEndTime(args.startTime),
          location: args.location || '',
          color: args.color || '#4F9DA6',
        };
        addEvent(event);
        setActionsExecuted(prev => [...prev, { type: 'event', title: event.title }]);
        toast({ title: '📅 Evento agendado!', description: event.title });
      } else if (toolCall.function.name === 'add_transaction') {
        const transaction = {
          type: args.type as 'income' | 'expense',
          amount: args.amount,
          description: args.description,
          category: args.category || 'Outros',
          date: args.date || today,
        };
        addTransaction(transaction);
        setActionsExecuted(prev => [...prev, { 
          type: 'transaction', 
          title: `R$ ${transaction.amount.toFixed(2)} - ${transaction.description}`,
          transactionType: transaction.type
        }]);
        toast({
          title: transaction.type === 'income' ? '💰 Receita registrada!' : '💸 Despesa registrada!',
          description: `${transaction.description}: R$ ${transaction.amount.toFixed(2)}`,
        });
      } else if (toolCall.function.name === 'add_note') {
        const note = {
          title: args.title,
          content: args.content,
          color: args.color,
        };
        addNote(note);
        setActionsExecuted(prev => [...prev, { type: 'note', title: note.title }]);
        toast({ title: '📝 Anotação criada!', description: note.title });
      } else if (toolCall.function.name === 'add_diary_entry') {
        const entry = {
          content: args.content,
          mood: args.mood || 'neutral',
          highlights: args.highlights || '',
          date: args.date || today,
        };
        addDiaryEntry(entry);
        setActionsExecuted(prev => [...prev, { type: 'diary', title: 'Entrada no diário' }]);
        toast({ title: '📔 Diário atualizado!', description: 'Sua reflexão foi salva' });
      }
      console.log('Tool executed:', toolCall.function.name, args);
    } catch (error) {
      console.error('Error executing tool call:', error);
    }
  };

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHour = (hours + 1) % 24;
    return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setActionsExecuted([]);
    
    addChatMessage({ role: 'user', content: userMessage });
    setIsTyping(true);

    try {
      // Calculate financial summary for Sara
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      const expensesByCategory: Record<string, number> = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

      // Build messages array for the API - limit to last 20 messages to avoid rate limits
      const recentMessages = chatMessages.slice(-20);
      const apiMessages = [
        ...recentMessages.map(msg => ({
          role: msg.role === 'sara' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: apiMessages,
          userName: user.name,
          currentDate: new Date().toISOString().split('T')[0],
          financialContext: totalIncome > 0 ? {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            expensesByCategory,
            expenseRatio: ((totalExpenses / totalIncome) * 100).toFixed(0),
          } : null,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Calma, muitas mensagens de uma vez! 😅 Espere alguns segundos e tente novamente.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao conectar com a Sara');
      }

      if (!response.body) {
        throw new Error('Resposta vazia');
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';
      let toolCallsBuffer: { [key: number]: { id: string; type: string; function: { name: string; arguments: string } } } = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line by line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            
            // Handle text content
            if (delta?.content) {
              assistantContent += delta.content;
            }
            
            // Handle tool calls
            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                const index = tc.index ?? 0;
                if (!toolCallsBuffer[index]) {
                  toolCallsBuffer[index] = {
                    id: tc.id || '',
                    type: tc.type || 'function',
                    function: { name: '', arguments: '' }
                  };
                }
                if (tc.id) toolCallsBuffer[index].id = tc.id;
                if (tc.function?.name) toolCallsBuffer[index].function.name = tc.function.name;
                if (tc.function?.arguments) toolCallsBuffer[index].function.arguments += tc.function.arguments;
              }
            }
          } catch {
            // Incomplete JSON, will be handled in next chunk
          }
        }
      }

      // Execute tool calls
      const toolCalls = Object.values(toolCallsBuffer);
      for (const toolCall of toolCalls) {
        if (toolCall.function.name && toolCall.function.arguments) {
          executeToolCall(toolCall);
        }
      }

      // Add the complete message
      if (assistantContent) {
        addChatMessage({ role: 'sara', content: assistantContent });
      } else if (toolCalls.length > 0) {
      // If only tool calls were made without text, add a confirmation message
        const routineCount = toolCalls.filter(tc => tc.function.name === 'add_routine').length;
        const reminderCount = toolCalls.filter(tc => tc.function.name === 'add_reminder').length;
        const taskCount = toolCalls.filter(tc => tc.function.name === 'add_task').length;
        const eventCount = toolCalls.filter(tc => tc.function.name === 'add_event').length;
        const transactionCount = toolCalls.filter(tc => tc.function.name === 'add_transaction').length;
        const noteCount = toolCalls.filter(tc => tc.function.name === 'add_note').length;
        const diaryCount = toolCalls.filter(tc => tc.function.name === 'add_diary_entry').length;
        let confirmationParts = [];
        if (routineCount > 0) confirmationParts.push(`${routineCount} item(ns) de rotina`);
        if (reminderCount > 0) confirmationParts.push(`${reminderCount} lembrete(s)`);
        if (taskCount > 0) confirmationParts.push(`${taskCount} tarefa(s)`);
        if (eventCount > 0) confirmationParts.push(`${eventCount} evento(s)`);
        if (transactionCount > 0) confirmationParts.push(`${transactionCount} transação(ões)`);
        if (noteCount > 0) confirmationParts.push(`${noteCount} anotação(ões)`);
        if (diaryCount > 0) confirmationParts.push(`${diaryCount} entrada(s) no diário`);
        
        let tabSuggestion = routineCount > 0 ? 'Rotina' : reminderCount > 0 ? 'Lembretes' : taskCount > 0 ? 'Tarefas' : eventCount > 0 ? 'Calendário' : noteCount > 0 ? 'Anotações' : diaryCount > 0 ? 'Diário' : 'Finanças';
        addChatMessage({ role: 'sara', content: `Pronto! Criei ${confirmationParts.join(' e ')} pra você aqui no app! 💜 Confere lá na aba de ${tabSuggestion}! ✨` });
      }

    } catch (error) {
      console.error('Sara Chat error:', error);
      toast({
        title: 'Ops!',
        description: error instanceof Error ? error.message : 'Erro ao conversar com a Sara',
        variant: 'destructive',
      });
      addChatMessage({ role: 'sara', content: 'Desculpa, tive um probleminha aqui! 😅 Pode tentar de novo?' });
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceToggle = () => {
    toggleListening();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4">
        <button onClick={() => setShowPhoto(true)} className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-glow ring-2 ring-primary/30 hover:ring-primary/60 transition-all cursor-pointer">
            <img src={saraAvatar} alt="Sara" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Sara Ortiz</h2>
            <p className="text-xs text-muted-foreground">Sua assistente para TDAH</p>
          </div>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearChat}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
        {chatMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto mb-4 shadow-glow ring-4 ring-primary/20">
              <img src={saraAvatar} alt="Sara" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Oiii, {user.name}! 💜
            </h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Sou a Sara, criadora de conteúdo sobre TDAH no @saraortiz.ai! 
              Estou aqui pra te ajudar a organizar sua rotina com leveza e sem julgamentos. 
              Me conta, como posso te ajudar hoje? ✨
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-sara-teal-light text-foreground rounded-full text-xs">
                <CheckCircle2 className="w-3 h-3" /> Criar tarefas
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-sara-coral-light text-foreground rounded-full text-xs">
                <Calendar className="w-3 h-3" /> Agendar eventos
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-foreground rounded-full text-xs">
                <DollarSign className="w-3 h-3" /> Registrar finanças
              </span>
            </div>
            <button
              onClick={() => window.open("https://www.instagram.com/saraortiz.ai/", "_blank")}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              📸 Me siga no Instagram
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {chatMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'sara' && (
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                  <img src={saraAvatar} alt="Sara" className="w-full h-full object-cover" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-sara-teal-light text-foreground rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Actions executed indicator */}
        {actionsExecuted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start"
          >
            <div className="flex flex-wrap gap-2 ml-10">
              {actionsExecuted.map((action, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    action.type === 'routine'
                      ? 'bg-sara-teal/20 text-sara-teal border border-sara-teal/30'
                      : action.type === 'reminder'
                      ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                      : action.type === 'task' 
                      ? 'bg-sara-teal/20 text-sara-teal border border-sara-teal/30' 
                      : action.type === 'event'
                      ? 'bg-sara-coral/20 text-sara-coral border border-sara-coral/30'
                      : action.type === 'note'
                      ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                      : action.type === 'diary'
                      ? 'bg-purple-500/20 text-purple-600 border border-purple-500/30'
                      : action.transactionType === 'income'
                      ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                      : 'bg-red-500/20 text-red-600 border border-red-500/30'
                  }`}
                >
                  {action.type === 'task' 
                    ? <CheckCircle2 className="w-3 h-3" /> 
                    : action.type === 'event' 
                    ? <Calendar className="w-3 h-3" />
                    : <DollarSign className="w-3 h-3" />}
                  {action.title}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
              <img src={saraAvatar} alt="Sara" className="w-full h-full object-cover" />
            </div>
            <div className="bg-sara-teal-light px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-border mt-4">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceToggle}
            disabled={isTyping || isTranscribing || audioLimitReached}
            className={`rounded-xl flex-shrink-0 transition-all relative ${
              audioLimitReached
                ? 'opacity-50 cursor-not-allowed'
                : isListening 
                ? 'bg-destructive text-destructive-foreground ring-2 ring-destructive/50' 
                : isTranscribing
                ? 'bg-primary/20 text-primary animate-pulse'
                : ''
            }`}
            title={audioLimitReached ? 'Limite de 1h/mês atingido' : isListening ? 'Toque para parar' : isTranscribing ? 'Transcrevendo...' : 'Falar com a Sara'}
          >
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
            )}
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>
          {isListening && (
            <span className="text-xs text-destructive font-medium self-center animate-pulse">
              Gravando... toque para parar
            </span>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite ou peça: 'Crie uma tarefa para...'"
            className="sara-input flex-1"
            disabled={isTyping}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-sara rounded-xl flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          💜 Sara não dá conselhos médicos. Para questões de saúde, procure um profissional.
        </p>
      </div>

      {/* Sara Photo Modal */}
      <AnimatePresence>
        {showPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
            onClick={() => setShowPhoto(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPhoto(false)}
                className="absolute -top-12 right-0 text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
              <img
                src={saraAvatar}
                alt="Sara - Assistente Pessoal"
                className="w-64 h-64 rounded-full object-cover ring-4 ring-primary shadow-2xl"
              />
              <p className="text-center text-white font-semibold mt-4 text-lg">Sara ✨</p>
              <p className="text-center text-white/70 text-sm">Sua assistente pessoal para TDAH</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SaraChat;
