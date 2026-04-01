import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { DrinkSale } from '../types';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { format } from 'date-fns';

export const DrinkManager: React.FC = () => {
  const { user } = useAuth();
  const { data: tickets, loading } = useSupabase<DrinkSale>('drink_sales');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    server_name: '',
    drink_name: '',
    quantity: 1,
    unit_price: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      ...formData,
      quantity: Number(formData.quantity),
      unit_price: Number(formData.unit_price),
      admin_id: user.id
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('drink_sales')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('drink_sales')
          .insert([payload]);
        if (error) throw error;
      }
      setIsAdding(false);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        server_name: '',
        drink_name: '',
        quantity: 1,
        unit_price: 0
      });
    } catch (err) {
      console.error('Error saving drink ticket:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        const { error } = await supabase
          .from('drink_sales')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting ticket:', err);
      }
    }
  };

  const handleEdit = (ticket: DrinkSale) => {
    setEditingId(ticket.id!);
    setFormData({
      date: ticket.date,
      server_name: ticket.server_name,
      drink_name: ticket.drink_name,
      quantity: ticket.quantity,
      unit_price: ticket.unit_price
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drinks / Server Tickets</h1>
          <p className="text-gray-500">Track drink sales per server and item</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          New Ticket
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{editingId ? 'Edit Ticket' : 'New Ticket Entry'}</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Server Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.server_name}
                onChange={(e) => setFormData({ ...formData, server_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drink Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.drink_name}
                onChange={(e) => setFormData({ ...formData, drink_name: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (DH)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
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
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Server</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Drink</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Qty</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Unit Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{ticket.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ticket.server_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ticket.drink_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">{ticket.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ticket.unit_price} DH</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">{ticket.total.toLocaleString()} DH</td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <button
                      onClick={() => handleEdit(ticket)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(ticket.id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No drink tickets found.
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
