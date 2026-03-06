import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2, DollarSign, PieChart, BarChart3, Target, AlertTriangle, Bell, X } from 'lucide-react';
import { useSara } from '@/contexts/SaraContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useSpendingAlerts } from '@/hooks/useSpendingAlerts';

const CATEGORIES = {
  income: ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros'],
  expense: ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Outros'],
};

const CATEGORY_COLORS: Record<string, string> = {
  Moradia: '#FF6B6B',
  Alimentação: '#4ECDC4',
  Transporte: '#45B7D1',
  Saúde: '#96CEB4',
  Lazer: '#FFEAA7',
  Educação: '#DDA0DD',
  Outros: '#B0B0B0',
  Salário: '#4F9DA6',
  Freelance: '#6C63FF',
  Investimentos: '#2ECC71',
  Vendas: '#F39C12',
};

// Regra 50/30/20 - Categorização
const NEEDS_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Saúde']; // Necessidades
const WANTS_CATEGORIES = ['Lazer', 'Educação', 'Outros']; // Desejos
const SAVINGS_CATEGORIES = ['Investimentos']; // Poupança

export const Finances: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, user } = useSara();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  // Hook que monitora gastos e dispara alertas automáticos
  const spendingAnalysis = useSpendingAlerts(transactions);
  
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Data for expense by category pie chart
  const expenseByCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });
    
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#B0B0B0',
    }));
  }, [transactions]);

  // Data for monthly evolution chart
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; receitas: number; despesas: number }> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      months[key] = { month: monthName.charAt(0).toUpperCase() + monthName.slice(1), receitas: 0, despesas: 0 };
    }
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        if (t.type === 'income') {
          months[key].receitas += t.amount;
        } else {
          months[key].despesas += t.amount;
        }
      }
    });
    
    return Object.values(months);
  }, [transactions]);

  // Regra 50/30/20 calculation
  const rule503020 = useMemo(() => {
    const needs = transactions
      .filter(t => t.type === 'expense' && NEEDS_CATEGORIES.includes(t.category))
      .reduce((acc, t) => acc + t.amount, 0);
    
    const wants = transactions
      .filter(t => t.type === 'expense' && WANTS_CATEGORIES.includes(t.category))
      .reduce((acc, t) => acc + t.amount, 0);
    
    const savings = transactions
      .filter(t => t.type === 'income' && SAVINGS_CATEGORIES.includes(t.category))
      .reduce((acc, t) => acc + t.amount, 0);
    
    const idealNeeds = totalIncome * 0.5;
    const idealWants = totalIncome * 0.3;
    const idealSavings = totalIncome * 0.2;
    
    return {
      needs: { current: needs, ideal: idealNeeds, percent: totalIncome > 0 ? (needs / totalIncome) * 100 : 0 },
      wants: { current: wants, ideal: idealWants, percent: totalIncome > 0 ? (wants / totalIncome) * 100 : 0 },
      savings: { current: savings, ideal: idealSavings, percent: totalIncome > 0 ? (savings / totalIncome) * 100 : 0 },
    };
  }, [transactions, totalIncome]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.category) return;
    
    addTransaction({
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      category: newTransaction.category,
      date: newTransaction.date,
    });
    
    setNewTransaction({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsOpen(false);
  };

  return (
    <div className="py-4 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sara-card bg-sara-mint-light"
        >
          <TrendingUp className="w-5 h-5 text-sara-mint mb-2" />
          <p className="text-xs text-muted-foreground">Ganhos</p>
          <p className="text-lg font-bold text-foreground">
            R$ {totalIncome.toLocaleString('pt-BR')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sara-card bg-sara-coral-light"
        >
          <TrendingDown className="w-5 h-5 text-sara-coral mb-2" />
          <p className="text-xs text-muted-foreground">Gastos</p>
          <p className="text-lg font-bold text-foreground">
            R$ {totalExpenses.toLocaleString('pt-BR')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`sara-card ${balance >= 0 ? 'bg-sara-teal-light' : 'bg-destructive/10'}`}
        >
          <Wallet className={`w-5 h-5 mb-2 ${balance >= 0 ? 'text-primary' : 'text-destructive'}`} />
          <p className="text-xs text-muted-foreground">Saldo</p>
          <p className={`text-lg font-bold ${balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            R$ {balance.toLocaleString('pt-BR')}
          </p>
        </motion.div>
      </div>

      {/* Alertas Persistentes de Gastos */}
      <AnimatePresence>
        {(spendingAnalysis.needs.isOver || spendingAnalysis.wants.isOver || spendingAnalysis.savings.isUnder) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Bell className="w-4 h-4 text-primary" />
              <span>Alertas de Gastos</span>
            </div>
            
            {spendingAnalysis.needs.isOver && !dismissedAlerts.includes('needs') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl"
              >
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-orange-600 text-sm">Necessidades acima de 50%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Você está gastando {spendingAnalysis.needs.percent.toFixed(0)}% da renda com necessidades. 
                    Revise gastos fixos como aluguel, transporte ou alimentação.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => setDismissedAlerts(prev => [...prev, 'needs'])}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {spendingAnalysis.wants.isOver && !dismissedAlerts.includes('wants') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-start gap-3 p-3 bg-sara-coral/10 border border-sara-coral/30 rounded-xl"
              >
                <AlertTriangle className="w-5 h-5 text-sara-coral flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sara-coral text-sm">Gastos supérfluos acima de 30%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Você está gastando {spendingAnalysis.wants.percent.toFixed(0)}% da renda com desejos. 
                    Considere reduzir gastos com lazer, streaming ou compras não essenciais.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => setDismissedAlerts(prev => [...prev, 'wants'])}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {spendingAnalysis.savings.isUnder && !dismissedAlerts.includes('savings') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-600 text-sm">Poupança abaixo de 20%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Você está poupando apenas {spendingAnalysis.savings.percent.toFixed(0)}% da renda. 
                    Tente reservar mais para investimentos e emergências.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => setDismissedAlerts(prev => [...prev, 'savings'])}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expense Alert */}
      {expenseRatio > 80 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="sara-card bg-sara-coral-light border-sara-coral"
        >
          <p className="font-semibold text-sara-coral">⚠️ Atenção, {user.name}!</p>
          <p className="text-sm text-foreground mt-1">
            Seus gastos estão em {expenseRatio.toFixed(0)}% dos seus ganhos.
            Considere revisar suas despesas para manter um equilíbrio financeiro saudável.
          </p>
        </motion.div>
      )}

      {/* Regra 50/30/20 */}
      {totalIncome > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="sara-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Regra 50/30/20</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Método de educação financeira: 50% necessidades, 30% desejos, 20% poupança
          </p>
          
          <div className="space-y-4">
            {/* Necessidades - 50% */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  🏠 Necessidades
                  <span className="text-xs text-muted-foreground">(Moradia, Alimentação, Transporte, Saúde)</span>
                </span>
                <span className={`text-sm font-bold ${rule503020.needs.percent > 50 ? 'text-sara-coral' : 'text-sara-mint'}`}>
                  {rule503020.needs.percent.toFixed(0)}% / 50%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${rule503020.needs.percent > 50 ? 'bg-sara-coral' : 'bg-sara-teal'}`}
                  style={{ width: `${Math.min(rule503020.needs.percent * 2, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>R$ {rule503020.needs.current.toLocaleString('pt-BR')}</span>
                <span>Meta: R$ {rule503020.needs.ideal.toLocaleString('pt-BR')}</span>
              </div>
              {rule503020.needs.percent > 50 && (
                <p className="text-xs text-sara-coral mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Acima do ideal em R$ {(rule503020.needs.current - rule503020.needs.ideal).toLocaleString('pt-BR')}
                </p>
              )}
            </div>

            {/* Desejos - 30% */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  🎮 Desejos
                  <span className="text-xs text-muted-foreground">(Lazer, Educação, Outros)</span>
                </span>
                <span className={`text-sm font-bold ${rule503020.wants.percent > 30 ? 'text-sara-coral' : 'text-sara-mint'}`}>
                  {rule503020.wants.percent.toFixed(0)}% / 30%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${rule503020.wants.percent > 30 ? 'bg-sara-coral' : 'bg-purple-500'}`}
                  style={{ width: `${Math.min((rule503020.wants.percent / 30) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>R$ {rule503020.wants.current.toLocaleString('pt-BR')}</span>
                <span>Meta: R$ {rule503020.wants.ideal.toLocaleString('pt-BR')}</span>
              </div>
              {rule503020.wants.percent > 30 && (
                <p className="text-xs text-sara-coral mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Gastos supérfluos acima do ideal em R$ {(rule503020.wants.current - rule503020.wants.ideal).toLocaleString('pt-BR')}
                </p>
              )}
            </div>

            {/* Poupança - 20% */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  💰 Poupança/Investimentos
                </span>
                <span className={`text-sm font-bold ${rule503020.savings.percent < 20 ? 'text-yellow-500' : 'text-sara-mint'}`}>
                  {rule503020.savings.percent.toFixed(0)}% / 20%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${rule503020.savings.percent >= 20 ? 'bg-sara-mint' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min((rule503020.savings.percent / 20) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>R$ {rule503020.savings.current.toLocaleString('pt-BR')}</span>
                <span>Meta: R$ {rule503020.savings.ideal.toLocaleString('pt-BR')}</span>
              </div>
              {rule503020.savings.percent < 20 && (
                <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Faltam R$ {(rule503020.savings.ideal - rule503020.savings.current).toLocaleString('pt-BR')} para atingir a meta
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}


      {/* Charts Section */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expenses by Category */}
          {expenseByCategory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="sara-card"
            >
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Gastos por Categoria</h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {expenseByCategory.map((cat) => (
                  <span 
                    key={cat.name}
                    className="inline-flex items-center gap-1.5 text-xs"
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Monthly Evolution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="sara-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Evolução Mensal</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={2}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                    width={35}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value) => <span className="text-foreground">{value}</span>}
                  />
                  <Bar dataKey="receitas" name="Receitas" fill="#4F9DA6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* Transactions List */}
      <section>
        <h2 className="sara-section-title">Transações Recentes</h2>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="sara-card flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  transaction.type === 'income'
                    ? 'bg-sara-mint-light text-sara-mint'
                    : 'bg-sara-coral-light text-sara-coral'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {transaction.description || transaction.category}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="sara-badge text-xs bg-secondary text-secondary-foreground">
                      {transaction.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === 'income' ? 'text-sara-mint' : 'text-sara-coral'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR')}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTransaction(transaction.id)}
                  className="text-muted-foreground hover:text-destructive flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {transactions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma transação registrada
            </p>
          )}
        </div>
      </section>

      {/* Add Transaction FAB */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-sara rounded-2xl shadow-glow flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-primary-foreground" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewTransaction({ ...newTransaction, type: 'income', category: '' })}
                className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  newTransaction.type === 'income'
                    ? 'bg-sara-mint text-card'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Ganho</span>
              </button>
              <button
                type="button"
                onClick={() => setNewTransaction({ ...newTransaction, type: 'expense', category: '' })}
                className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  newTransaction.type === 'expense'
                    ? 'bg-sara-coral text-card'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <TrendingDown className="w-5 h-5" />
                <span className="font-medium">Gasto</span>
              </button>
            </div>

            <div>
              <Label htmlFor="amount">Valor</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  placeholder="0,00"
                  className="sara-input pl-9"
                />
              </div>
            </div>

            <div>
              <Label>Categoria</Label>
              <Select
                value={newTransaction.category}
                onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
              >
                <SelectTrigger className="sara-input">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES[newTransaction.type].map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                placeholder="Detalhes da transação..."
                className="sara-input"
              />
            </div>

            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                className="sara-input"
              />
            </div>

            <Button 
              type="submit" 
              className={`w-full ${
                newTransaction.type === 'income' 
                  ? 'bg-sara-mint hover:bg-sara-mint/90' 
                  : 'bg-sara-coral hover:bg-sara-coral/90'
              }`}
            >
              Adicionar {newTransaction.type === 'income' ? 'Ganho' : 'Gasto'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Finances;
