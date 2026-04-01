import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { BusDriverMeal } from '../types';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { format } from 'date-fns';

export const BusDriverManager: React.FC = () => {
  const { user } = useAuth();
  const { data: records, loading } = useSupabase<BusDriverMeal>('bus_driver_meals');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    drivers_count: 1,
    meal_type: 'Tajine',
    quantity: 1,
    estimated_cost: 35
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      ...formData,
      drivers_count: Number(formData.drivers_count),
      quantity: Number(formData.quantity),
      estimated_cost: Number(formData.estimated_cost),
      admin_id: user.id
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('bus_driver_meals')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('bus_driver_meals')
          .insert([payload]);
        if (error) throw error;
      }
      setIsAdding(false);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        drivers_count: 1,
        meal_type: 'Tajine',
        quantity: 1,
        estimated_cost: 35
      });
    } catch (err) {
      console.error('Error saving bus driver record:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        const { error } = await supabase
          .from('bus_driver_meals')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting record:', err);
      }
    }
  };

  const handleEdit = (record: BusDriverMeal) => {
    setEditingId(record.id!);
    setFormData({
      date: record.date,
      drivers_count: record.drivers_count,
      meal_type: record.meal_type,
      quantity: record.quantity,
      estimated_cost: record.estimated_cost
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bus Drivers (Free Meals)</h1>
          <p className="text-gray-500">Track free meals provided to bus drivers (recorded as expenses)</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Record Meal
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{editingId ? 'Edit Record' : 'New Meal Record'}</h2>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Drivers</label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.drivers_count}
                onChange={(e) => setFormData({ ...formData, drivers_count: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (DH)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: Number(e.target.value) })}
              />
            </div>
            <div className="lg:col-span-3 flex justify-end gap-3 mt-2">
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
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Drivers</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Meal Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Qty</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Est. Cost</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{record.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">{record.drivers_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{record.meal_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">{record.quantity}</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">{record.estimated_cost.toLocaleString()} DH</td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <button
                      onClick={() => handleEdit(record)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No bus driver records found.
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
