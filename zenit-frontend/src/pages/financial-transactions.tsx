// zenit-frontend/src/pages/financial-transactions.tsx
import { useState, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../../services/api';

// Interfaces
interface FinancialTransaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: string;
  status: string;
  accountId: number;
  categoryId?: number;
  notes?: string;
  account: {
    name: string;
  };
  category?: {
    name: string;
    color: string;
  };
}

interface FinancialAccount {
  id: number;
  name: string;
  type: string;
}

interface FinancialCategory {
  id: number;
  name: string;
  type: string;
  color: string;
}

interface FormData {
  description: string;
  amount: number;
  date: string;
  type: string;
  status: string;
  accountId: number;
  categoryId?: number;
  notes?: string;
}

interface FilterData {
  startDate?: string;
  endDate?: string;
  accountId?: number;
  categoryId?: number;
  type?: string;
  status?: string;
}

export default function FinancialTransactionsPage() {
  // Estados para lista de transações
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para contas e categorias (para selects)
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  
  // Estados para modal de formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  // Estado do formulário de transação
  const [formData, setFormData] = useState<FormData>({
    description: '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense',
    status: 'completed',
    accountId: 0,
    categoryId: undefined,
    notes: ''
  });
  
  // Estado para filtros
  const [filterData, setFilterData] = useState<FilterData>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado para confirmação de exclusão
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Buscar dados iniciais
  useEffect(() => {
    fetchAccounts();
    fetchCategories();
    fetchTransactions();
  }, []);
  
  // Buscar transações com filtros
  async function fetchTransactions() {
    setIsLoading(true);
    setError(null);
    
    try {
      // Construir query params para filtros
      const params = new URLSearchParams();
      
      if (filterData.startDate) {
        params.append('startDate', filterData.startDate);
      }
      
      if (filterData.endDate) {
        params.append('endDate', filterData.endDate);
      }
      
      if (filterData.accountId) {
        params.append('accountId', filterData.accountId.toString());
      }
      
      if (filterData.categoryId) {
        params.append('categoryId', filterData.categoryId.toString());
      }
      
      if (filterData.type) {
        params.append('type', filterData.type);
      }
      
      if (filterData.status) {
        params.append('status', filterData.status);
      }
      
      const response = await api.get(`/financial-transactions${params.toString() ? `?${params.toString()}` : ''}`);
      setTransactions(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar transações:', err);
      setError(err.response?.data?.error || 'Erro ao carregar as transações financeiras');
    } finally {
      setIsLoading(false);
    }
  }
  
  // Buscar contas para selects
  async function fetchAccounts() {
    try {
      const response = await api.get('/financial-accounts');
      setAccounts(response.data);
      
      // Se temos contas e não há conta selecionada no formulário, selecionar a primeira
      if (response.data.length > 0 && formData.accountId === 0) {
        setFormData(prev => ({ ...prev, accountId: response.data[0].id }));
      }
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
    }
  }
  
  // Buscar categorias para selects
  async function fetchCategories() {
    try {
      const response = await api.get('/financial-categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  }
  
  // Lidar com mudanças no formulário
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    
    // Converter para número quando aplicável
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else if (name === 'categoryId' && value === '') {
      // Tratar valor vazio no select de categoria (opcional)
      setFormData({ ...formData, categoryId: undefined });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }
  
  // Lidar com mudanças nos filtros
  function handleFilterChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    
    if (value === '') {
      // Se o valor está vazio, remove o filtro
      const newFilters = { ...filterData };
      delete newFilters[name as keyof FilterData];
      setFilterData(newFilters);
    } else {
      // Caso contrário, atualiza o filtro
      setFilterData({ ...filterData, [name]: value });
    }
  }
  
  // Aplicar filtros
  function handleApplyFilters() {
    fetchTransactions();
  }
  
  // Limpar filtros
  function handleClearFilters() {
    setFilterData({});
    // Re-fetch com filtros limpos
    setTimeout(() => {
      fetchTransactions();
    }, 0);
  }
  
  // Abrir modal para criar transação
  function handleAddTransaction() {
    // Resetar formulário com valores padrão
    setFormData({
      description: '',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'expense',
      status: 'completed',
      accountId: accounts.length > 0 ? accounts[0].id : 0,
      categoryId: undefined,
      notes: ''
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsModalOpen(true);
  }
  
  // Abrir modal para editar transação
  function handleEditTransaction(transaction: FinancialTransaction) {
    // Converter formato de data para o esperado pelo input date
    const formattedDate = transaction.date.substring(0, 10);
    
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      date: formattedDate,
      type: transaction.type,
      status: transaction.status,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      notes: transaction.notes || ''
    });
    setIsEditing(true);
    setCurrentId(transaction.id);
    setIsModalOpen(true);
  }
  
  // Mostrar confirmação de exclusão
  function handleDeletePrompt(id: number) {
    setDeleteConfirmId(id);
  }
  
  // Cancelar exclusão
  function handleCancelDelete() {
    setDeleteConfirmId(null);
  }
  
  // Confirmar exclusão
  async function handleConfirmDelete() {
    if (deleteConfirmId === null) return;
    
    try {
      await api.delete(`/financial-transactions/${deleteConfirmId}`);
      setTransactions(transactions.filter(t => t.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error('Erro ao excluir transação:', err);
      alert(err.response?.data?.error || 'Erro ao excluir a transação financeira');
    }
  }
  
  // Enviar formulário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (isEditing && currentId) {
        // Atualizar transação existente
        await api.put(`/financial-transactions/${currentId}`, formData);
      } else {
        // Criar nova transação
        await api.post('/financial-transactions', formData);
      }
      
      // Recarregar transações e fechar modal
      fetchTransactions();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Erro ao salvar transação:', err);
      alert(err.response?.data?.error || 'Erro ao salvar a transação financeira');
    }
  }
  
  // Formatar valores monetários
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
  
  // Formatar data
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  }
  
  // Obter label para tipo de transação
  function getTransactionTypeLabel(type: string) {
    switch (type) {
      case 'income': return 'Receita';
      case 'expense': return 'Despesa';
      case 'transfer': return 'Transferência';
      default: return type;
    }
  }
  
  // Obter label para status de transação
  function getTransactionStatusLabel(status: string) {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }
  
  // Obter classe CSS para o status
  function getStatusClasses(status: string) {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'cancelled': return 'bg-neutral-200 text-neutral-700';
      default: return 'bg-neutral-200 text-neutral-700';
    }
  }
  
  // Obter classe CSS para o tipo de transação (para o valor)
  function getAmountClasses(type: string) {
    switch (type) {
      case 'income': return 'text-success';
      case 'expense': return 'text-danger';
      case 'transfer': return 'text-primary';
      default: return '';
    }
  }
  
  return (
    <Layout title="Transações Financeiras">
      {/* Cabeçalho com filtros e botão de adicionar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-heading font-bold">Transações Financeiras</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-neutral-600 hover:text-primary"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>
        
        <Button 
          onClick={handleAddTransaction}
          leftIcon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Nova Transação
        </Button>
      </div>
      
      {/* Filtros */}
      {showFilters && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Filtro por datas */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Data Inicial"
                id="startDate"
                name="startDate"
                type="date"
                value={filterData.startDate || ''}
                onChange={handleFilterChange}
              />
              <Input
                label="Data Final"
                id="endDate"
                name="endDate"
                type="date"
                value={filterData.endDate || ''}
                onChange={handleFilterChange}
              />
            </div>
            
            {/* Filtro por conta */}
            <div>
              <label htmlFor="accountId" className="block text-sm font-medium text-neutral-700 mb-1">
                Conta
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
            
            {/* Filtro por categoria */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700 mb-1">
                Categoria
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={filterData.categoryId || ''}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Todas as categorias</option>
                <option value="-1">Sem categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filtro por tipo */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-1">
                Tipo
              </label>
              <select
                id="type"
                name="type"
                value={filterData.type || ''}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Todos os tipos</option>
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
                <option value="transfer">Transferência</option>
              </select>
            </div>
            
            {/* Filtro por status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filterData.status || ''}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Todos os status</option>
                <option value="completed">Concluída</option>
                <option value="pending">Pendente</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            
            {/* Botões de ação */}
            <div className="flex items-end space-x-2">
              <Button 
                variant="primary" 
                onClick={handleApplyFilters}
                size="sm"
              >
                Aplicar Filtros
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleClearFilters}
                size="sm"
              >
                Limpar
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Exibir erro, se houver */}
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Lista de transações */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <p>Nenhuma transação financeira encontrada.</p>
            <p className="mt-2">Clique em "Nova Transação" para adicionar uma.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Data</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Descrição</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Conta</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Categoria</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Valor</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-600">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="border-t border-neutral-200">
                    <td className="px-4 py-3 text-sm">{formatDate(transaction.date)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{transaction.description}</div>
                      {transaction.notes && (
                        <div className="text-xs text-neutral-500 mt-1">{transaction.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{transaction.account.name}</td>
                    <td className="px-4 py-3">
                      {transaction.category ? (
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-2" 
                            style={{ backgroundColor: transaction.category.color }}
                          ></div>
                          <span className="text-sm">{transaction.category.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-500">-</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${getAmountClasses(transaction.type)}`}>
                      {transaction.type === 'income' && '+'}
                      {transaction.type === 'expense' && '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(transaction.status)}`}>
                        {getTransactionStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {deleteConfirmId === transaction.id ? (
                        <div className="flex items-center space-x-2 justify-center">
                          <button 
                            onClick={handleConfirmDelete}
                            className="text-danger hover:text-danger-dark"
                          >
                            Confirmar
                          </button>
                          <button 
                            onClick={handleCancelDelete}
                            className="text-neutral-500 hover:text-neutral-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 justify-center">
                          <button 
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-primary hover:text-primary-dark"
                            title="Editar"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeletePrompt(transaction.id)}
                            className="text-danger hover:text-danger-dark"
                            title="Excluir"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Modal de formulário */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-heading font-semibold">
                  {isEditing ? 'Editar Transação' : 'Nova Transação'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Descrição */}
                <Input
                  label="Descrição"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
                
                {/* Tipo de transação */}
                <div className="mb-4">
                  <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-1">
                    Tipo de Transação
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                    <option value="transfer">Transferência</option>
                  </select>
                </div>
                
                {/* Conta */}
                <div className="mb-4">
                  <label htmlFor="accountId" className="block text-sm font-medium text-neutral-700 mb-1">
                    Conta
                  </label>
                  <select
                    id="accountId"
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Selecione uma conta</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Categoria (opcional) */}
                <div className="mb-4">
                  <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700 mb-1">
                    Categoria (opcional)
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Sem categoria</option>
                    {categories
                      .filter(category => 
                        // Filtrar categorias pelo tipo de transação
                        (formData.type === 'income' && category.type === 'income') || 
                        (formData.type === 'expense' && category.type === 'expense')
                      )
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                {/* Valor */}
                <Input
                  label="Valor"
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount.toString()}
                  onChange={handleInputChange}
                  required
                />
                
                {/* Data */}
                <Input
                  label="Data"
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
                
                {/* Status */}
                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="completed">Concluída</option>
                    <option value="pending">Pendente</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                
                {/* Observações (opcional) */}
                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
                    Observações (opcional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    rows={3}
                  ></textarea>
                </div>
                
                <div className="flex justify-end mt-6 space-x-3">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant={formData.type === 'income' ? 'success' : (formData.type === 'expense' ? 'danger' : 'primary')}
                    type="submit"
                  >
                    {isEditing ? 'Salvar Alterações' : 'Criar Transação'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}