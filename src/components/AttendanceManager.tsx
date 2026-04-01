import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Attendance, Employee } from '../types';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { format } from 'date-fns';

export const AttendanceManager: React.FC = () => {
  const { user } = useAuth();
  const { data: attendance, loading: loadingAttendance } = useSupabase<Attendance>('attendance');
  const { data: employees } = useSupabase<Employee>('employees');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    employee_id: '',
    status: 'present' as 'present' | 'absent',
    salary_paid: 0,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const employee = employees.find(emp => emp.id === formData.employee_id);
    if (!employee) return;

    const payload = {
      ...formData,
      salary_paid: Number(formData.salary_paid),
      admin_id: user.id
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('attendance')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('attendance')
          .insert([payload]);
        if (error) throw error;
      }
      setIsAdding(false);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        employee_id: '',
        status: 'present',
        salary_paid: 0,
        notes: ''
      });
    } catch (err) {
      console.error('Error saving attendance:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        const { error } = await supabase
          .from('attendance')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting attendance:', err);
      }
    }
  };

  const handleEdit = (record: Attendance) => {
    setEditingId(record.id!);
    setFormData({
      date: record.date,
      employee_id: record.employee_id,
      status: record.status,
      salary_paid: record.salary_paid,
      notes: record.notes || ''
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance & Salary</h1>
          <p className="text-gray-500">Mark daily attendance and record daily salaries</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Mark Attendance
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{editingId ? 'Edit Record' : 'New Attendance Record'}</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'present' | 'absent' })}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Salary (DH)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.salary_paid}
                onChange={(e) => setFormData({ ...formData, salary_paid: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Optional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Employee</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Salary</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Notes</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{record.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {employees.find(e => e.id === record.employee_id)?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === 'present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {record.status === 'present' ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{(record.salary_paid || 0).toLocaleString()} DH</td>
                  <td className="px-6 py-4 text-sm text-gray-500 italic">{record.notes || '-'}</td>
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
              {attendance.length === 0 && !loadingAttendance && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No attendance records found.
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
