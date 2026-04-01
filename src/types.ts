export interface Revenue {
  id?: string;
  created_at?: string;
  updated_at?: string;
  date: string;
  food_revenue: number;
  drinks_revenue: number;
  other_revenue: number;
  total_revenue: number;
  admin_id?: string;
}

export interface Expense {
  id?: string;
  created_at?: string;
  updated_at?: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  type: 'daily' | 'monthly';
  notes?: string;
  admin_id?: string;
}

export interface Tajine {
  id?: string;
  created_at?: string;
  updated_at?: string;
  date: string;
  prepared: number;
  sold: number;
  price: number;
  remaining: number;
  revenue: number;
  admin_id?: string;
}

export interface DrinkSale {
  id?: string;
  created_at?: string;
  updated_at?: string;
  date: string;
  server_name: string;
  drink_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  admin_id?: string;
}

export interface BusDriverMeal {
  id?: string;
  created_at?: string;
  updated_at?: string;
  date: string;
  drivers_count: number;
  meal_type: string;
  quantity: number;
  estimated_cost: number;
  notes?: string;
  admin_id?: string;
}

export interface Employee {
  id?: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  role: string;
  phone?: string;
  status: 'active' | 'inactive';
  admin_id?: string;
}

export interface Attendance {
  id?: string;
  created_at?: string;
  updated_at?: string;
  date: string;
  employee_id: string;
  status: 'present' | 'absent';
  salary_paid: number;
  notes?: string;
  admin_id?: string;
}

export type Shift = 'Morning' | 'Afternoon' | 'Night';

export interface Planning {
  id?: string;
  created_at?: string;
  updated_at?: string;
  date: string;
  employee_id: string;
  shift: Shift | string;
  role: string;
  admin_id?: string;
}

export interface User {
  id: string;
  email: string;
}
