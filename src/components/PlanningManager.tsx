import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Planning, Employee } from '../types';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { format } from 'date-fns';

const SHIFTS = ['morning', 'afternoon', 'evening', 'full'];

export const PlanningManager: React.FC = () => {
  const { user } = useAuth();
  const { data: shifts, loading: loadingShifts } = useSupabase<Planning>('planning');
  const { data: employees } = useSupabase<Employee>('employees');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    employee_id: '',
    shift: 'morning',
    role: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const employee = employees.find(emp => emp.id === formData.employee_id);
    if (!employee) return;

    const payload = {
      ...formData,
      role: formData.role || employee.role,
      admin_id: user.id
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('planning')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('planning')
          .insert([payload]);
        if (error) throw error;
      }
      setIsAdding(false);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        employee_id: '',
        shift: 'morning',
        role: ''
      });
    } catch (err) {
      console.error('Error saving shift:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        const { error } = await supabase
          .from('planning')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting shift:', err);
      }
    }
  };

  const handleEdit = (record: Planning) => {
    setEditingId(record.id!);
    setFormData({
      date: record.date,
      employee_id: record.employee_id,
      shift: record.shift,
      role: record.role
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning (Schedule)</h1>
          <p className="text-gray-500">Assign employees to shifts and roles</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Shift
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{editingId ? 'Edit Shift' : 'New Shift Assignment'}</h2>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
              >
                {SHIFTS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role (Override)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Leave blank for default"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
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
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Employee</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Shift</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Assigned Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shifts.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{record.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {employees.find(e => e.id === record.employee_id)?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium capitalize">
                      {record.shift}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{record.role}</td>
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
              {shifts.length === 0 && !loadingShifts && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No shifts planned.
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
