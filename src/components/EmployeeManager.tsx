import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Employee } from '../types';
import { Plus, Trash2, Edit2, X, Check, Users } from 'lucide-react';

const ROLES = ['cook', 'server', 'barman', 'manager'];

export const EmployeeManager: React.FC = () => {
  const { user } = useAuth();
  const { data: employees, loading } = useSupabase<Employee>('employees');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'server' as 'cook' | 'server' | 'barman' | 'manager'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload = {
      ...formData,
      admin_id: user.id
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('employees')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('employees')
          .insert([payload]);
        if (error) throw error;
      }
      setIsAdding(false);
      setFormData({ name: '', role: 'server' });
    } catch (err) {
      console.error('Error saving employee:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting employee:', err);
      }
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id!);
    setFormData({ name: employee.name, role: employee.role });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-500">Manage your restaurant staff and their roles</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{editingId ? 'Edit Employee' : 'New Employee'}</h2>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                {ROLES.map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{employee.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{employee.role}</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(employee)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(employee.id!)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {employees.length === 0 && !loading && (
          <div className="md:col-span-3 text-center py-12 text-gray-500">
            No employees found.
          </div>
        )}
      </div>
    </div>
  );
};
