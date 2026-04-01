import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { Revenue } from '../types';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { format } from 'date-fns';

export const RevenueManager: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: revenues, loading } = useSupabase<Revenue>('revenues');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    food_revenue: 0,
    drinks_revenue: 0,
    other_revenue: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      ...formData,
      food_revenue: Number(formData.food_revenue),
      drinks_revenue: Number(formData.drinks_revenue),
      other_revenue: Number(formData.other_revenue),
      admin_id: user.id
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('revenues')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('revenues')
          .insert([payload]);
        if (error) throw error;
      }
      setIsAdding(false);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        food_revenue: 0,
        drinks_revenue: 0,
        other_revenue: 0
      });
    } catch (err) {
      console.error('Error saving revenue:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        const { error } = await supabase
          .from('revenues')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting revenue:', err);
      }
    }
  };

  const handleEdit = (revenue: Revenue) => {
    setEditingId(revenue.id!);
    setFormData({
      date: revenue.date,
      food_revenue: revenue.food_revenue,
      drinks_revenue: revenue.drinks_revenue,
      other_revenue: revenue.other_revenue
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.revenue')}</h1>
          <p className="text-gray-500">{t('revenue.subtitle')}</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          {t('common.add')}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{editingId ? t('common.edit') : t('common.add')}</h2>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('revenue.date')}</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('revenue.food')} (DH)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.food_revenue}
                onChange={(e) => setFormData({ ...formData, food_revenue: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('revenue.drinks')} (DH)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.drinks_revenue}
                onChange={(e) => setFormData({ ...formData, drinks_revenue: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('revenue.other')} (DH)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.other_revenue}
                onChange={(e) => setFormData({ ...formData, other_revenue: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Check size={20} />
                {editingId ? t('common.update') : t('common.save')}
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
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">{t('revenue.date')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">{t('revenue.food')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">{t('revenue.drinks')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">{t('revenue.other')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">{t('revenue.total')}</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {revenues.map((revenue) => (
                <tr key={revenue.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{revenue.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{revenue.food_revenue.toLocaleString()} DH</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{revenue.drinks_revenue.toLocaleString()} DH</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{revenue.other_revenue.toLocaleString()} DH</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">{revenue.total_revenue.toLocaleString()} DH</td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <button
                      onClick={() => handleEdit(revenue)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(revenue.id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {revenues.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('common.no_data')}
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
