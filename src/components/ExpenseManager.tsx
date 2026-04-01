import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Expense } from '../types';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { format } from 'date-fns';

const DAILY_CATEGORIES = ['Butcher', 'Vegetables', 'Groceries', 'Transport', 'Others'];
const MONTHLY_CATEGORIES = ['Rent', 'Water', 'Electricity', 'CNSS', 'Internet', 'Others'];

export const ExpenseManager: React.FC = () => {
  const { user } = useAuth();
  const { data: expenses, loading } = useSupabase<Expense>('expenses');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'monthly'>('all');
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: DAILY_CATEGORIES[0],
    type: 'daily' as 'daily' | 'monthly',
    description: '',
    amount: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      admin_id: user.id
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('expenses')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([payload]);
        if (error) throw error;
      }
      setIsAdding(false);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: formData.type === 'daily' ? DAILY_CATEGORIES[0] : MONTHLY_CATEGORIES[0],
        type: formData.type,
        description: '',
        amount: 0
      });
    } catch (err) {
      console.error('Error saving expense:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting expense:', err);
      }
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id!);
    setFormData({
      date: expense.date,
      category: expense.category,
      type: expense.type,
      description: expense.description,
      amount: expense.amount
    });
    setIsAdding(true);
  };

  const filteredExpenses = expenses.filter(e => filterType === 'all' || e.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-500">Manage daily operational and monthly fixed expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === 'all' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('daily')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === 'daily' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setFilterType('monthly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterType === 'monthly' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Monthly
            </button>
          </div>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{editingId ? 'Edit Expense' : 'New Expense Entry'}</h2>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.type}
                onChange={(e) => {
                  const type = e.target.value as 'daily' | 'monthly';
                  setFormData({ 
                    ...formData, 
                    type, 
                    category: type === 'daily' ? DAILY_CATEGORIES[0] : MONTHLY_CATEGORIES[0] 
                  });
                }}
              >
                <option value="daily">Daily Operational</option>
                <option value="monthly">Monthly Fixed (Incremental)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {(formData.type === 'daily' ? DAILY_CATEGORIES : MONTHLY_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (DH)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 5kg tomatoes, part of monthly rent..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Check size={20} />
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{expense.date}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${expense.type === 'daily' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {expense.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{expense.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 italic">{expense.description || '-'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">{expense.amount.toLocaleString()} DH</td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No expense data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
