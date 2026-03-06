import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/sara';

// Regra 50/30/20 - Categorização
const NEEDS_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Saúde'];
const WANTS_CATEGORIES = ['Lazer', 'Educação', 'Outros'];

interface SpendingAnalysis {
  needs: { current: number; ideal: number; percent: number; isOver: boolean };
  wants: { current: number; ideal: number; percent: number; isOver: boolean };
  savings: { current: number; ideal: number; percent: number; isUnder: boolean };
  categoryBreakdown: Record<string, { amount: number; type: 'need' | 'want' }>;
}

export const analyzeSpending = (transactions: Transaction[]): SpendingAnalysis => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const needs = transactions
    .filter(t => t.type === 'expense' && NEEDS_CATEGORIES.includes(t.category))
    .reduce((acc, t) => acc + t.amount, 0);

  const wants = transactions
    .filter(t => t.type === 'expense' && WANTS_CATEGORIES.includes(t.category))
    .reduce((acc, t) => acc + t.amount, 0);

  const savings = transactions
    .filter(t => t.type === 'income' && t.category === 'Investimentos')
    .reduce((acc, t) => acc + t.amount, 0);

  const idealNeeds = totalIncome * 0.5;
  const idealWants = totalIncome * 0.3;
  const idealSavings = totalIncome * 0.2;

  // Category breakdown
  const categoryBreakdown: Record<string, { amount: number; type: 'need' | 'want' }> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = {
          amount: 0,
          type: NEEDS_CATEGORIES.includes(t.category) ? 'need' : 'want',
        };
      }
      categoryBreakdown[t.category].amount += t.amount;
    });

  return {
    needs: {
      current: needs,
      ideal: idealNeeds,
      percent: totalIncome > 0 ? (needs / totalIncome) * 100 : 0,
      isOver: needs > idealNeeds && totalIncome > 0,
    },
    wants: {
      current: wants,
      ideal: idealWants,
      percent: totalIncome > 0 ? (wants / totalIncome) * 100 : 0,
      isOver: wants > idealWants && totalIncome > 0,
    },
    savings: {
      current: savings,
      ideal: idealSavings,
      percent: totalIncome > 0 ? (savings / totalIncome) * 100 : 0,
      isUnder: savings < idealSavings && totalIncome > 0,
    },
    categoryBreakdown,
  };
};

export const useSpendingAlerts = (transactions: Transaction[]) => {
  const { toast } = useToast();
  const prevAnalysis = useRef<SpendingAnalysis | null>(null);
  const hasShownInitialAlert = useRef(false);

  useEffect(() => {
    if (transactions.length === 0) return;

    const analysis = analyzeSpending(transactions);
    const prev = prevAnalysis.current;

    // Only show alerts after initial load and when state changes
    if (prev && hasShownInitialAlert.current) {
      // Check if needs just went over limit
      if (analysis.needs.isOver && !prev.needs.isOver) {
        toast({
          title: '⚠️ Alerta de Gastos - Necessidades',
          description: `Seus gastos com necessidades ultrapassaram 50% da renda (${analysis.needs.percent.toFixed(0)}%). Considere revisar despesas fixas.`,
          variant: 'destructive',
          duration: 8000,
        });
      }

      // Check if wants just went over limit
      if (analysis.wants.isOver && !prev.wants.isOver) {
        toast({
          title: '⚠️ Alerta de Gastos Supérfluos',
          description: `Gastos com desejos ultrapassaram 30% da renda (${analysis.wants.percent.toFixed(0)}%). Hora de reduzir gastos não essenciais! 💜`,
          variant: 'destructive',
          duration: 8000,
        });
      }

      // Check category-specific increases
      Object.entries(analysis.categoryBreakdown).forEach(([category, data]) => {
        const prevCat = prev.categoryBreakdown[category];
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        
        if (totalIncome > 0) {
          const categoryPercent = (data.amount / totalIncome) * 100;
          const prevPercent = prevCat ? (prevCat.amount / totalIncome) * 100 : 0;
          
          // Alert when a single category exceeds 20% of income
          if (categoryPercent > 20 && prevPercent <= 20 && data.type === 'want') {
            toast({
              title: `📊 ${category} acima do ideal`,
              description: `Você já gastou ${categoryPercent.toFixed(0)}% da sua renda em ${category}. Considere reduzir!`,
              duration: 6000,
            });
          }
        }
      });
    }

    prevAnalysis.current = analysis;
    hasShownInitialAlert.current = true;
  }, [transactions, toast]);

  return analyzeSpending(transactions);
};
