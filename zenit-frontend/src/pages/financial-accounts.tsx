// zenit-frontend/src/pages/financial-accounts.tsx
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../../services/api';

// Interfaces
interface FinancialAccount {
  id: number;
  name: string;
  type: string;
  balance: number;
  accountNumber?: string;
  bankName?: string;
  isActive: boolean;
  createdAt: string;
}

interface FormData {
  name: string;
  type: string;
  balance: number;
  accountNumber?: string;
  bankName?: string;
}

// Lista de tipos de conta
const accountTypes = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'investment', label: 'Investimento' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'cash', label: 'Dinheiro em Espécie' },
];

export default function FinancialAccountsPage() {
  // Estados para lista de contas
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modal de formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  // Estado do formulário
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'checking',
    balance: 0,
    accountNumber: '',
    bankName: '',
  });
  
  // Estado para confirmação de exclusão
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Buscar contas financeiras
  useEffect(() => {
    fetchAccounts();
  }, []);
  
  async function fetchAccounts() {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/financial-accounts');
      setAccounts(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar contas:', err);
      setError(err.response?.data?.error || 'Erro ao carregar as contas financeiras');
    } finally {
      setIsLoading(false);
    }
  }
  
  // Lidar com mudanças no formulário
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    
    // Converter para número quando aplicável
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }
  
  // Abrir modal para criar conta
  function handleAddAccount() {
    setFormData({
      name: '',
      type: 'checking',
      balance: 0,
      accountNumber: '',
      bankName: '',
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsModalOpen(true);
  }
  
  // Abrir modal para editar conta
  function handleEditAccount(account: FinancialAccount) {
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
      accountNumber: account.accountNumber || '',
      bankName: account.bankName || '',
    });
    setIsEditing(true);
    setCurrentId(account.id);
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
      await api.delete(`/financial-accounts/${deleteConfirmId}`);
      setAccounts(accounts.filter(acc => acc.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error('Erro ao excluir conta:', err);
      alert(err.response?.data?.error || 'Erro ao excluir a conta financeira');
    }
  }
  
  // Enviar formulário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (isEditing && currentId) {
        // Atualizar conta existente
        await api.put(`/financial-accounts/${currentId}`, formData);
      } else {
        // Criar nova conta
        await api.post('/financial-accounts', formData);
      }
      
      // Recarregar contas e fechar modal
      fetchAccounts();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Erro ao salvar conta:', err);
      alert(err.response?.data?.error || 'Erro ao salvar a conta financeira');
    }
  }
  
  // Formatar valores monetários
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
  
  // Traduzir tipo de conta
  function getAccountTypeLabel(type: string) {
    const accountType = accountTypes.find(t => t.value === type);
    return accountType ? accountType.label : type;
  }
  
  return (
    <Layout title="Contas Financeiras">
      {/* Cabeçalho com botão de adicionar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-heading font-bold">Contas Financeiras</h1>
        <Button 
          onClick={handleAddAccount}
          leftIcon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Nova Conta
        </Button>
      </div>
      
      {/* Exibir erro, se houver */}
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Tabela de contas */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <p>Nenhuma conta financeira encontrada.</p>
            <p className="mt-2">Clique em "Nova Conta" para adicionar uma.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Banco</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Saldo</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-600">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(account => (
                  <tr key={account.id} className="border-t border-neutral-200">
                    <td className="px-4 py-3 text-sm">{account.name}</td>
                    <td className="px-4 py-3 text-sm">{getAccountTypeLabel(account.type)}</td>
                    <td className="px-4 py-3 text-sm">{account.bankName || '-'}</td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      account.balance >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      {formatCurrency(account.balance)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.isActive 
                          ? 'bg-success/10 text-success' 
                          : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {account.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {deleteConfirmId === account.id ? (
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
                            onClick={() => handleEditAccount(account)}
                            className="text-primary hover:text-primary-dark"
                            title="Editar"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeletePrompt(account.id)}
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
                  {isEditing ? 'Editar Conta' : 'Nova Conta'}
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
                {/* Nome da conta */}
                <Input
                  label="Nome da Conta"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                
                {/* Tipo de conta */}
                <div className="mb-4">
                  <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-1">
                    Tipo de Conta
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    {accountTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Saldo */}
                <Input
                  label="Saldo Inicial"
                  id="balance"
                  name="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance.toString()}
                  onChange={handleInputChange}
                  required
                />
                
                {/* Dados bancários */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Banco"
                    id="bankName"
                    name="bankName"
                    value={formData.bankName || ''}
                    onChange={handleInputChange}
                  />
                  
                  <Input
                    label="Número da Conta"
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.accountNumber || ''}
                    onChange={handleInputChange}
                  />
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
                    variant="primary"
                    type="submit"
                  >
                    {isEditing ? 'Salvar Alterações' : 'Criar Conta'}
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