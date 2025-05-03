// zenit-frontend/src/pages/reports.tsx
import { useState, useEffect } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../../services/api';

// Interfaces
interface FinancialAccount {
  id: number;
  name: string;
  balance: number;
}

interface ExpenseByCategory {
  categoryId: number;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

interface IncomeByCategory {
  categoryId: number;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

interface FilterData {
  startDate: string;
  endDate: string;
  accountId?: number;
}

// Cores padrão para categorias sem cor definida
const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#a855f7', '#f97316'
];

export default function ReportsPage() {
  // Estado para dados dos relatórios
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>([]);
  const [incomesByCategory, setIncomesByCategory] = useState<IncomeByCategory[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  
  // Estado para total de receitas e despesas no período
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  
  // Estado para filtragem
  const currentDate = new Date();
  const lastMonthStart = startOfMonth(subMonths(currentDate, 1));
  const lastMonthEnd = endOfMonth(subMonths(currentDate, 1));
  
  const [filterData, setFilterData] = useState<FilterData>({
    startDate: format(lastMonthStart, 'yyyy-MM-dd'),
    endDate: format(lastMonthEnd, 'yyyy-MM-dd')
  });
  
  // Estado de carregamento e erro
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Buscar dados iniciais - contas e relatórios
  useEffect(() => {
    fetchAccounts();
    fetchReportData();
  }, []);
  
  // Buscar contas
  async function fetchAccounts() {
    try {
      const response = await api.get('/financial-accounts');
      setAccounts(response.data);
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
    }
  }
  
  // Buscar dados para relatórios
  async function fetchReportData() {
    setIsLoading(true);
    setError(null);
    
    try {
      // Em um caso real, você teria endpoints específicos para relatórios
      // Por exemplo:
      // const incomesByCategoryResponse = await api.get('/reports/incomes-by-category', { params: filterData });
      // const expensesByCategoryResponse = await api.get('/reports/expenses-by-category', { params: filterData });
      // const monthlyDataResponse = await api.get('/reports/monthly-data', { params: filterData });
      
      // Dados simulados para demonstração
      const simulatedExpensesByCategory = [
        { categoryId: 1, categoryName: 'Aluguel', color: '#ef4444', amount: 1200, percentage: 30 },
        { categoryId: 2, categoryName: 'Alimentação', color: '#f97316', amount: 800, percentage: 20 },
        { categoryId: 3, categoryName: 'Transporte', color: '#f59e0b', amount: 400, percentage: 10 },
        { categoryId: 4, categoryName: 'Lazer', color: '#84cc16', amount: 600, percentage: 15 },
        { categoryId: 5, categoryName: 'Saúde', color: '#06b6d4', amount: 500, percentage: 12.5 },
        { categoryId: 6, categoryName: 'Outros', color: '#8b5cf6', amount: 500, percentage: 12.5 }
      ];
      
      const simulatedIncomesByCategory = [
        { categoryId: 7, categoryName: 'Salário', color: '#10b981', amount: 3500, percentage: 70 },
        { categoryId: 8, categoryName: 'Freelance', color: '#3b82f6', amount: 800, percentage: 16 },
        { categoryId: 9, categoryName: 'Investimentos', color: '#a855f7', amount: 450, percentage: 9 },
        { categoryId: 10, categoryName: 'Outros', color: '#8b5cf6', amount: 250, percentage: 5 }
      ];
      
      const simulatedMonthlyData = [
        { month: 'Jan/23', income: 4800, expense: 3800, balance: 1000 },
        { month: 'Fev/23', income: 5000, expense: 3900, balance: 1100 },
        { month: 'Mar/23', income: 4700, expense: 4200, balance: 500 },
        { month: 'Abr/23', income: 4900, expense: 4000, balance: 900 },
        { month: 'Mai/23', income: 5200, expense: 4100, balance: 1100 },
        { month: 'Jun/23', income: 5000, expense: 4300, balance: 700 }
      ];
      
      // Calcular totais
      const totalInc = simulatedIncomesByCategory.reduce((acc, curr) => acc + curr.amount, 0);
      const totalExp = simulatedExpensesByCategory.reduce((acc, curr) => acc + curr.amount, 0);
      
      setExpensesByCategory(simulatedExpensesByCategory);
      setIncomesByCategory(simulatedIncomesByCategory);
      setMonthlyData(simulatedMonthlyData);
      setTotalIncome(totalInc);
      setTotalExpense(totalExp);
      setBalance(totalInc - totalExp);
    } catch (err: any) {
      console.error('Erro ao buscar dados dos relatórios:', err);
      setError(err.response?.data?.error || 'Erro ao carregar os relatórios financeiros');
    } finally {
      setIsLoading(false);
    }
  }
  
  // Lidar com mudanças nos filtros
  function handleFilterChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFilterData({ ...filterData, [name]: value });
  }
  
  // Aplicar filtros
  function handleApplyFilters() {
    fetchReportData();
  }
  
  // Formatar valores monetários
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
  
  // Formatar percentagem
  function formatPercentage(value: number) {
    return `${value.toFixed(1)}%`;
  }
  
  // Renderizar tooltip customizado para gráficos
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow-md rounded-md border border-neutral-200">
          <p className="font-medium">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Layout title="Relatórios Financeiros">
      <div className="mb-6">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por período */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Data Inicial"
                id="startDate"
                name="startDate"
                type="date"
                value={filterData.startDate}
                onChange={handleFilterChange}
              />
              <Input
                label="Data Final"
                id="endDate"
                name="endDate"
                type="date"
                value={filterData.endDate}
                onChange={handleFilterChange}
              />
            </div>
            
            {/* Filtro por conta (opcional) */}
            <div>
              <label htmlFor="accountId" className="block text-sm font-medium text-neutral-700 mb-1">
                Conta (opcional)
              </label>
              <select
                id="accountId"
                name="accountId"
                value={filterData.accountId || ''}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Todas as contas</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Botão de aplicar filtros */}
            <div className="flex items-end">
              <Button 
                variant="primary" 
                onClick={handleApplyFilters}
                size="sm"
              >
                Atualizar Relatórios
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Exibir erro, se houver */}
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Resumo financeiro do período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-success text-white">
          <div className="flex flex-col">
            <span className="text-sm font-medium opacity-80">Receitas no Período</span>
            <span className="text-2xl font-semibold mt-1">
              {isLoading ? '...' : formatCurrency(totalIncome)}
            </span>
          </div>
        </Card>
        
        <Card className="bg-danger text-white">
          <div className="flex flex-col">
            <span className="text-sm font-medium opacity-80">Despesas no Período</span>
            <span className="text-2xl font-semibold mt-1">
              {isLoading ? '...' : formatCurrency(totalExpense)}
            </span>
          </div>
        </Card>
        
        <Card className={`${balance >= 0 ? 'bg-primary' : 'bg-danger'} text-white`}>
          <div className="flex flex-col">
            <span className="text-sm font-medium opacity-80">Saldo no Período</span>
            <span className="text-2xl font-semibold mt-1">
              {isLoading ? '...' : formatCurrency(balance)}
            </span>
          </div>
        </Card>
      </div>
      
      {/* Gráficos de categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Despesas por categoria */}
        <Card title="Despesas por Categoria">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : expensesByCategory.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              Nenhum dado disponível para o período selecionado.
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="categoryName"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {!isLoading && expensesByCategory.length > 0 && (
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-neutral-600">
                    <th className="text-left">Categoria</th>
                    <th className="text-right">Valor</th>
                    <th className="text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesByCategory.map((category) => (
                    <tr key={category.categoryId} className="text-sm">
                      <td className="py-1">
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-2" 
                            style={{ backgroundColor: category.color || '#6b7280' }}
                          ></div>
                          {category.categoryName}
                        </div>
                      </td>
                      <td className="text-right py-1">{formatCurrency(category.amount)}</td>
                      <td className="text-right py-1">{formatPercentage(category.percentage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        
        {/* Receitas por categoria */}
        <Card title="Receitas por Categoria">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : incomesByCategory.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              Nenhum dado disponível para o período selecionado.
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="categoryName"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {incomesByCategory.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {!isLoading && incomesByCategory.length > 0 && (
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <table className="w-full">
                <thead>
                  <tr className="text-sm text-neutral-600">
                    <th className="text-left">Categoria</th>
                    <th className="text-right">Valor</th>
                    <th className="text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {incomesByCategory.map((category) => (
                    <tr key={category.categoryId} className="text-sm">
                      <td className="py-1">
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-2" 
                            style={{ backgroundColor: category.color || '#6b7280' }}
                          ></div>
                          {category.categoryName}
                        </div>
                      </td>
                      <td className="text-right py-1">{formatCurrency(category.amount)}</td>
                      <td className="text-right py-1">{formatPercentage(category.percentage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      
      {/* Gráfico de evolução mensal */}
      <Card title="Evolução Mensal">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            Nenhum dado disponível para o período selecionado.
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="income" name="Receitas" fill="#10b981" />
                <Bar dataKey="expense" name="Despesas" fill="#ef4444" />
                <Bar dataKey="balance" name="Saldo" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </Layout>
  );
}