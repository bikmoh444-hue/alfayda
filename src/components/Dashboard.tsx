import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { Revenue, Expense, BusDriverMeal, Attendance } from '../types';
import { format, isSameDay, isSameMonth, isSameYear, parseISO, subDays } from 'date-fns';
import { supabase } from '../supabase';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: revenues } = useSupabase<Revenue>('revenues');
  const { data: expenses } = useSupabase<Expense>('expenses');
  const { data: bus_driver_meals } = useSupabase<BusDriverMeal>('bus_driver_meals');
  const { data: attendance } = useSupabase<Attendance>('attendance');

  const seedData = async () => {
    if (!user) return;
    
    const { data: existing } = await supabase.from('revenues').select('id').limit(1);
    if (existing && existing.length > 0) return;

    console.log('Seeding demo data...');
    const days = 14;
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      
      // Revenue
      const food = 2000 + Math.random() * 1000;
      const drinks = 500 + Math.random() * 500;
      const other = 100 + Math.random() * 200;
      await supabase.from('revenues').insert([{
        date,
        food_revenue: food,
        drinks_revenue: drinks,
        other_revenue: other,
        total_revenue: food + drinks + other,
        admin_id: user.id
      }]);

      // Daily Expenses
      await supabase.from('expenses').insert([{
        date,
        category: 'Butcher',
        type: 'daily',
        description: 'Daily meat supply',
        amount: 400 + Math.random() * 200,
        admin_id: user.id
      }]);

      // Monthly Expenses (part of it)
      await supabase.from('expenses').insert([{
        date,
        category: 'Rent',
        type: 'monthly',
        description: 'Daily rent portion',
        amount: 100,
        admin_id: user.id
      }]);
    }
    window.location.reload();
  };

  const stats = useMemo(() => {
    const now = new Date();
    
    const calculateTotals = (items: any[], dateFilter: (d: Date) => boolean, amountKey: string) => {
      return items
        .filter(item => dateFilter(parseISO(item.date)))
        .reduce((sum, item) => sum + (item[amountKey] || 0), 0);
    };

    // Daily
    const dailyRev = calculateTotals(revenues, d => isSameDay(d, now), 'total_revenue');
    const dailyExp = calculateTotals(expenses, d => isSameDay(d, now), 'amount') +
                    calculateTotals(bus_driver_meals, d => isSameDay(d, now), 'estimated_cost') +
                    calculateTotals(attendance, d => isSameDay(d, now), 'salary_paid');
    const dailyProfit = dailyRev - dailyExp;

    // Monthly
    const monthlyRev = calculateTotals(revenues, d => isSameMonth(d, now), 'total_revenue');
    const monthlyExp = calculateTotals(expenses, d => isSameMonth(d, now), 'amount') +
                      calculateTotals(bus_driver_meals, d => isSameMonth(d, now), 'estimated_cost') +
                      calculateTotals(attendance, d => isSameMonth(d, now), 'salary_paid');
    const monthlyProfit = monthlyRev - monthlyExp;

    // Yearly
    const yearlyRev = calculateTotals(revenues, d => isSameYear(d, now), 'total_revenue');
    const yearlyExp = calculateTotals(expenses, d => isSameYear(d, now), 'amount') +
                     calculateTotals(bus_driver_meals, d => isSameYear(d, now), 'estimated_cost') +
                     calculateTotals(attendance, d => isSameYear(d, now), 'salary_paid');
    const yearlyProfit = yearlyRev - yearlyExp;

    return {
      daily: { rev: dailyRev, exp: dailyExp, profit: dailyProfit },
      monthly: { rev: monthlyRev, exp: monthlyExp, profit: monthlyProfit },
      yearly: { rev: yearlyRev, exp: yearlyExp, profit: yearlyProfit }
    };
  }, [revenues, expenses, bus_driver_meals, attendance]);

  const chartData = useMemo(() => {
    // Last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'yyyy-MM-dd');
    }).reverse();

    return last7Days.map(date => {
      const d = parseISO(date);
      const rev = revenues.filter(r => isSameDay(parseISO(r.date), d)).reduce((s, r) => s + r.total_revenue, 0);
      const exp = expenses.filter(e => isSameDay(parseISO(e.date), d)).reduce((s, e) => s + e.amount, 0) +
                  bus_driver_meals.filter(b => isSameDay(parseISO(b.date), d)).reduce((s, b) => s + b.estimated_cost, 0) +
                  attendance.filter(a => isSameDay(parseISO(a.date), d)).reduce((s, a) => s + a.salary_paid, 0);
      return {
        name: format(d, 'MMM dd'),
        revenue: rev,
        expenses: exp,
        profit: rev - exp
      };
    });
  }, [revenues, expenses, bus_driver_meals, attendance]);

  const StatCard = ({ title, value, type, icon: Icon }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-3 rounded-xl",
          type === 'revenue' ? "bg-green-50 text-green-600" : 
          type === 'expense' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
        )}>
          <Icon size={24} />
        </div>
        <div className={cn(
          "flex items-center text-sm font-medium",
          value >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {value >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(value).toLocaleString()} DH
        </div>
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()} DH</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.dashboard')}</h1>
          <p className="text-gray-500">{t('dashboard.welcome')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={seedData}
            className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
          >
            Seed Demo Data
          </button>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{format(new Date(), 'MMMM dd, yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-orange-500" />
          {t('dashboard.daily')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title={t('dashboard.revenue')} value={stats.daily.rev} type="revenue" icon={TrendingUp} />
          <StatCard title={t('dashboard.expenses')} value={stats.daily.exp} type="expense" icon={TrendingDown} />
          <StatCard title={t('dashboard.profit')} value={stats.daily.profit} type="profit" icon={DollarSign} />
        </div>
      </section>

      {/* Monthly Stats */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-orange-500" />
          {t('dashboard.monthly')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title={t('dashboard.revenue')} value={stats.monthly.rev} type="revenue" icon={TrendingUp} />
          <StatCard title={t('dashboard.expenses')} value={stats.monthly.exp} type="expense" icon={TrendingDown} />
          <StatCard title={t('dashboard.profit')} value={stats.monthly.profit} type="profit" icon={DollarSign} />
        </div>
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">{t('dashboard.chart.rev_exp')}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar name={t('dashboard.revenue')} dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name={t('dashboard.expenses')} dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">{t('dashboard.chart.profit')}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area name={t('dashboard.profit')} type="monotone" dataKey="profit" stroke="#f97316" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
