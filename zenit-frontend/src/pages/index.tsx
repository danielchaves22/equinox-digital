// zenit-frontend/src/pages/index.tsx
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Tipo para o resumo financeiro
interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  accountsCount: number;
  pendingTransactionsCount: number;
}

// Tipo para conta financeira resumida
interface FinancialAccountSummary {
  id: number;
  name: string;
  balance: number;
  type: string;
}

// Tipo para transação financeira recente
interface RecentTransaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: string;
  status: string;
  accountName: string;
  categoryName?: string;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [accounts, setAccounts] = useState<FinancialAccountSummary[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Buscar dados do dashboard
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        
        // Aqui utilizaríamos uma API específica para o dashboard,
        // mas vamos simular alguns dados para demonstração
        
        // Em uma implementação real, seria algo como:
        // const { data } = await api.get('/dashboard');
        
        // Dados simulados
        const mockSummary: FinancialSummary = {
          totalBalance: 15420.65,
          totalIncome: 8500.00,
          totalExpense: 4250.35,
          accountsCount: 3,
          pendingTransactionsCount: 5
        };
        
        const mockAccounts: FinancialAccountSummary[] = [
          { id: 1, name: 'Conta Corrente', balance: 8250.45, type: 'checking' },
          { id: 2, name: 'Poupança', balance: 7170.20, type: 'savings' },
          { id: 3, name: 'Conta Investimento', balance: 0, type: 'investment' }
        ];
        
        const mockTransactions: RecentTransaction[] = [
          {
            id: 1,
            description: 'Pagamento Cliente XYZ',
            amount: 2500.00,
            date: '2023-06-15',
            type: 'income',
            status: 'completed',
            accountName: 'Conta Corrente',
            categoryName: 'Vendas'
          },
          {
            id: 2,
            description: 'Aluguel do Escritório',
            amount: 1200.00,
            date: '2023-06-10',
            type: 'expense',
            status: 'completed',
            accountName: 'Conta Corrente',
            categoryName: 'Aluguel'
          },
          {
            id: 3,
            description: 'Transferência para Poupança',
            amount: 1000.00,
            date: '2023-06-05',
            type: 'transfer',
            status: 'completed',
            accountName: 'Conta Corrente'
          },
          {
            id: 4,
            description: 'Pagamento Fornecedor ABC',
            amount: 850.35,
            date: '2023-06-02',
            type: 'expense',
            status: 'pending',
            accountName: 'Conta Corrente',
            categoryName: 'Fornecedores'
          }
        ];
        
        setSummary(mockSummary);
        setAccounts(mockAccounts);
        setRecentTransactions(mockTransactions);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  return (
    <Layout title="Dashboard">
      {/* Resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-primary text-white">
          <div className="flex flex-col">
            <span className="text-sm font-medium opacity-80">Saldo Total</span>
            <span className="text-2xl font-semibold mt-1">
              {isLoading ? '...' : formatCurrency(summary?.totalBalance || 0)}
            </span>
          </div>
        </Card>
        
        <Card className="bg-success text-white">
          <div className="flex flex-col">
            <span className="text-sm font-medium opacity-80">Receitas (mês atual)</span>
            <span className="text-2xl font-semibold mt-1">
              {isLoading ? '...' : formatCurrency(summary?.totalIncome || 0)}
            </span>
          </div>
        </Card>
        
        <Card className="bg-danger text-white">
          <div className="flex flex-col">
            <span className="text-sm font-medium opacity-80">Despesas (mês atual)</span>
            <span className="text-2xl font-semibold mt-1">
              {isLoading ? '...' : formatCurrency(summary?.totalExpense || 0)}
            </span>
          </div>
        </Card>
      </div>
      
      {/* Contas e Transações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas */}
        <Card title="Contas Financeiras">
          {isLoading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : (
            <>
              {accounts.length === 0 ? (
                <div className="text-center py-4 text-neutral-500">
                  Nenhuma conta financeira encontrada.
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map(account => (
                    <div key={account.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-neutral-500 capitalize">
                          {account.type === 'checking' && 'Conta Corrente'}
                          {account.type === 'savings' && 'Poupança'}
                          {account.type === 'investment' && 'Investimento'}
                        </div>
                      </div>
                      <div className={`text-lg font-semibold ${account.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(account.balance)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  }
                  onClick={() => window.location.href = '/financial-accounts'}
                >
                  Ver todas as contas
                </Button>
              </div>
            </>
          )}
        </Card>
        
        {/* Transações Recentes */}
        <Card title="Transações Recentes">
          {isLoading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : (
            <>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-4 text-neutral-500">
                  Nenhuma transação encontrada.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map(transaction => (
                    <div key={transaction.id} className="p-3 bg-neutral-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-neutral-500 mt-1">
                            {formatDate(transaction.date)} • {transaction.accountName}
                            {transaction.categoryName && ` • ${transaction.categoryName}`}
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          transaction.type === 'income' 
                            ? 'text-success' 
                            : transaction.type === 'expense' 
                              ? 'text-danger' 
                              : 'text-primary'
                        }`}>
                          {transaction.type === 'income' && '+'}
                          {transaction.type === 'expense' && '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'completed' 
                            ? 'bg-success/10 text-success' 
                            : transaction.status === 'pending' 
                              ? 'bg-warning/10 text-warning' 
                              : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          {transaction.status === 'completed' && 'Concluída'}
                          {transaction.status === 'pending' && 'Pendente'}
                          {transaction.status === 'cancelled' && 'Cancelada'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  }
                  onClick={() => window.location.href = '/financial-transactions'}
                >
                  Ver todas as transações
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
}