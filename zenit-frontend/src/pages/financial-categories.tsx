// zenit-frontend/src/pages/financial-categories.tsx
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../../services/api';

// Interfaces
interface FinancialCategory {
  id: number;
  name: string;
  type: string;
  color: string;
}

interface FormData {
  name: string;
  type: string;
  color: string;
}

// Cores predefinidas para escolha
const predefinedColors = [
  '#ef4444', // vermelho
  '#f97316', // laranja
  '#f59e0b', // âmbar
  '#eab308', // amarelo
  '#84cc16', // verde-limão
  '#22c55e', // verde
  '#10b981', // esmeralda
  '#14b8a6', // verde-azulado
  '#06b6d4', // ciano
  '#0ea5e9', // azul-claro
  '#3b82f6', // azul
  '#6366f1', // índigo
  '#8b5cf6', // violeta
  '#a855f7', // roxo
  '#d946ef', // fúcsia
  '#ec4899', // rosa
  '#f43f5e', // rosa-vermelho
  '#6b7280', // cinza
];

export default function FinancialCategoriesPage() {
  // Estados para lista de categorias
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<FinancialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  
  // Estados para modal de formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  // Estado do formulário
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'expense',
    color: predefinedColors[0]
  });
  
  // Estado para confirmação de exclusão
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Buscar categorias financeiras
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Filtrar categorias quando o filtro ou as categorias mudarem
  useEffect(() => {
    if (filter === 'all') {
      setFilteredCategories(categories);
    } else {
      setFilteredCategories(categories.filter(category => category.type === filter));
    }
  }, [categories, filter]);
  
  async function fetchCategories() {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/financial-categories');
      setCategories(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar categorias:', err);
      setError(err.response?.data?.error || 'Erro ao carregar as categorias financeiras');
    } finally {
      setIsLoading(false);
    }
  }
  
  // Lidar com mudanças no formulário
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }
  
  // Lidar com seleção de cor
  function handleColorChange(color: string) {
    setFormData({ ...formData, color });
  }
  
  // Mudar filtro de tipo
  function handleFilterChange(newFilter: string) {
    setFilter(newFilter);
  }
  
  // Abrir modal para criar categoria
  function handleAddCategory() {
    setFormData({
      name: '',
      type: 'expense',
      color: predefinedColors[0]
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsModalOpen(true);
  }
  
  // Abrir modal para editar categoria
  function handleEditCategory(category: FinancialCategory) {
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || predefinedColors[0]
    });
    setIsEditing(true);
    setCurrentId(category.id);
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
      await api.delete(`/financial-categories/${deleteConfirmId}`);
      setCategories(categories.filter(cat => cat.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error('Erro ao excluir categoria:', err);
      alert(err.response?.data?.error || 'Erro ao excluir a categoria financeira');
    }
  }
  
  // Enviar formulário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (isEditing && currentId) {
        // Atualizar categoria existente
        await api.put(`/financial-categories/${currentId}`, formData);
      } else {
        // Criar nova categoria
        await api.post('/financial-categories', formData);
      }
      
      // Recarregar categorias e fechar modal
      fetchCategories();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Erro ao salvar categoria:', err);
      alert(err.response?.data?.error || 'Erro ao salvar a categoria financeira');
    }
  }
  
  // Traduzir tipo de categoria
  function getCategoryTypeLabel(type: string) {
    return type === 'income' ? 'Receita' : 'Despesa';
  }
  
  return (
    <Layout title="Categorias Financeiras">
      {/* Cabeçalho com filtros e botão de adicionar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-heading font-bold">Categorias Financeiras</h1>
        
        <div className="flex space-x-4">
          <div className="flex rounded-lg overflow-hidden">
            <button
              className={`px-4 py-2 text-sm ${filter === 'all' ? 'bg-primary text-white' : 'bg-white text-neutral-700'}`}
              onClick={() => handleFilterChange('all')}
            >
              Todas
            </button>
            <button
              className={`px-4 py-2 text-sm ${filter === 'income' ? 'bg-success text-white' : 'bg-white text-neutral-700'}`}
              onClick={() => handleFilterChange('income')}
            >
              Receitas
            </button>
            <button
              className={`px-4 py-2 text-sm ${filter === 'expense' ? 'bg-danger text-white' : 'bg-white text-neutral-700'}`}
              onClick={() => handleFilterChange('expense')}
            >
              Despesas
            </button>
          </div>
          
          <Button 
            onClick={handleAddCategory}
            leftIcon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Nova Categoria
          </Button>
        </div>
      </div>
      
      {/* Exibir erro, se houver */}
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Lista de categorias */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-neutral-500">
            <p>Nenhuma categoria financeira encontrada.</p>
            <p className="mt-2">Clique em "Nova Categoria" para adicionar uma.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map(category => (
            <Card key={category.id} className="flex flex-col">
              <div className="flex items-center mb-3">
                <div 
                  className="h-6 w-6 rounded-full mr-3" 
                  style={{ backgroundColor: category.color || '#6b7280' }}
                ></div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
              </div>
              
              <div className="flex justify-between items-center mt-auto">
                <span className={`text-sm px-3 py-1 rounded-full ${
                  category.type === 'income' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-danger/10 text-danger'
                }`}>
                  {getCategoryTypeLabel(category.type)}
                </span>
                
                <div className="flex space-x-2">
                  {deleteConfirmId === category.id ? (
                    <>
                      <button 
                        onClick={handleConfirmDelete}
                        className="text-danger hover:text-danger-dark p-1"
                        title="Confirmar"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={handleCancelDelete}
                        className="text-neutral-500 hover:text-neutral-700 p-1"
                        title="Cancelar"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="text-primary hover:text-primary-dark p-1"
                        title="Editar"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeletePrompt(category.id)}
                        className="text-danger hover:text-danger-dark p-1"
                        title="Excluir"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Modal de formulário */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-heading font-semibold">
                  {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
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
                {/* Nome da categoria */}
                <Input
                  label="Nome da Categoria"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                
                {/* Tipo de categoria */}
                <div className="mb-4">
                  <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-1">
                    Tipo de Categoria
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </div>
                
                {/* Seletor de cor */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Cor
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 w-8 rounded-full ${
                          formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                      ></button>
                    ))}
                  </div>
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
                    variant={formData.type === 'income' ? 'success' : 'danger'}
                    type="submit"
                  >
                    {isEditing ? 'Salvar Alterações' : 'Criar Categoria'}
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