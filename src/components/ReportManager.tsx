import React, { useState, useMemo } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { Revenue, Expense, BusDriverMeal, Attendance } from '../types';
import { format, parseISO, isSameDay, isSameMonth, isSameYear } from 'date-fns';
import { FileText, Download, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const ReportManager: React.FC = () => {
  const { data: revenues } = useSupabase<Revenue>('revenues');
  const { data: expenses } = useSupabase<Expense>('expenses');
  const { data: bus_driver_meals } = useSupabase<BusDriverMeal>('bus_driver_meals');
  const { data: attendance } = useSupabase<Attendance>('attendance');

  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const reportData = useMemo(() => {
    const date = parseISO(selectedDate);
    
    const filterFn = (d: string) => {
      const itemDate = parseISO(d);
      if (reportType === 'daily') return isSameDay(itemDate, date);
      if (reportType === 'monthly') return isSameMonth(itemDate, date);
      return isSameYear(itemDate, date);
    };

    const filteredRevenues = revenues.filter(r => filterFn(r.date));
    const filteredExpenses = expenses.filter(e => filterFn(e.date));
    const filteredBus = bus_driver_meals.filter(b => filterFn(b.date));
    const filteredAttendance = attendance.filter(a => filterFn(a.date));

    const totalRev = filteredRevenues.reduce((s, r) => s + r.total_revenue, 0);
    const totalExp = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const totalBus = filteredBus.reduce((s, b) => s + b.estimated_cost, 0);
    const totalSalaries = filteredAttendance.reduce((s, a) => s + a.salary, 0);

    const netProfit = totalRev - (totalExp + totalBus + totalSalaries);

    return {
      title: reportType === 'daily' ? `Daily Report - ${selectedDate}` : 
             reportType === 'monthly' ? `Monthly Report - ${format(date, 'MMMM yyyy')}` : 
             `Yearly Report - ${format(date, 'yyyy')}`,
      totalRev,
      totalExp,
      totalBus,
      totalSalaries,
      netProfit,
      details: {
        revenues: filteredRevenues,
        expenses: filteredExpenses,
        bus: filteredBus,
        attendance: filteredAttendance
      }
    };
  }, [revenues, expenses, bus_driver_meals, attendance, reportType, selectedDate]);

  const exportToPDF = () => {
    const doc = new jsPDF() as any;
    doc.text(reportData.title, 14, 15);
    
    const summaryData = [
      ['Total Revenue', `${reportData.totalRev.toLocaleString()} DH`],
      ['Operational Expenses', `${reportData.totalExp.toLocaleString()} DH`],
      ['Bus Driver Costs', `${reportData.totalBus.toLocaleString()} DH`],
      ['Salaries', `${reportData.totalSalaries.toLocaleString()} DH`],
      ['Net Profit', `${reportData.netProfit.toLocaleString()} DH`]
    ];

    doc.autoTable({
      startY: 25,
      head: [['Category', 'Amount']],
      body: summaryData,
    });

    doc.save(`${reportData.title.replace(/ /g, '_')}.pdf`);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const summaryData = [
      { Category: 'Total Revenue', Amount: reportData.totalRev },
      { Category: 'Operational Expenses', Amount: reportData.totalExp },
      { Category: 'Bus Driver Costs', Amount: reportData.totalBus },
      { Category: 'Salaries', Amount: reportData.totalSalaries },
      { Category: 'Net Profit', Amount: reportData.netProfit }
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    const wsRevenues = XLSX.utils.json_to_sheet(reportData.details.revenues);
    XLSX.utils.book_append_sheet(wb, wsRevenues, 'Revenues');

    const wsExpenses = XLSX.utils.json_to_sheet(reportData.details.expenses);
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');

    XLSX.writeFile(wb, `${reportData.title.replace(/ /g, '_')}.xlsx`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500">Generate and export detailed financial reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToPDF}
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-2 transition-colors"
          >
            <Download size={18} />
            PDF
          </button>
          <button
            onClick={exportToExcel}
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-2 transition-colors"
          >
            <Download size={18} />
            Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['daily', 'monthly', 'yearly'] as const).map(type => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${reportType === type ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <input
              type={reportType === 'daily' ? 'date' : reportType === 'monthly' ? 'month' : 'number'}
              className="px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              value={reportType === 'yearly' ? selectedDate.split('-')[0] : selectedDate.slice(0, reportType === 'monthly' ? 7 : 10)}
              onChange={(e) => {
                let val = e.target.value;
                if (reportType === 'yearly') val = `${val}-01-01`;
                if (reportType === 'monthly') val = `${val}-01`;
                setSelectedDate(val);
              }}
              {...(reportType === 'yearly' ? { min: 2020, max: 2030 } : {})}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.totalRev.toLocaleString()} DH</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{(reportData.totalExp + reportData.totalBus + reportData.totalSalaries).toLocaleString()} DH</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Salaries Paid</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.totalSalaries.toLocaleString()} DH</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Net Profit</p>
          <p className={`text-2xl font-bold mt-1 ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {reportData.netProfit.toLocaleString()} DH
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <FileText size={20} className="text-orange-500" />
          <h3 className="font-semibold text-gray-900">Report Summary</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">Total Revenue Entries</span>
            <span className="font-medium">{reportData.details.revenues.length}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">Total Expense Entries</span>
            <span className="font-medium">{reportData.details.expenses.length}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">Bus Driver Records</span>
            <span className="font-medium">{reportData.details.bus.length}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">Attendance Records</span>
            <span className="font-medium">{reportData.details.attendance.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
