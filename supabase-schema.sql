-- SUPABASE SCHEMA FOR RESTAURANT ALFAYDA

-- 1. REVENUES TABLE
CREATE TABLE IF NOT EXISTS revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL,
  food_revenue NUMERIC DEFAULT 0,
  drinks_revenue NUMERIC DEFAULT 0,
  other_revenue NUMERIC DEFAULT 0,
  total_revenue NUMERIC GENERATED ALWAYS AS (food_revenue + drinks_revenue + other_revenue) STORED,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('daily', 'monthly')),
  notes TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. TAJINES TABLE
CREATE TABLE IF NOT EXISTS tajines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL,
  prepared INTEGER DEFAULT 0,
  sold INTEGER DEFAULT 0,
  price NUMERIC DEFAULT 0,
  remaining INTEGER GENERATED ALWAYS AS (prepared - sold) STORED,
  revenue NUMERIC GENERATED ALWAYS AS (sold * price) STORED,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 4. DRINK SALES TABLE
CREATE TABLE IF NOT EXISTS drink_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL,
  server_name TEXT NOT NULL,
  drink_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  total NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 5. BUS DRIVER MEALS TABLE
CREATE TABLE IF NOT EXISTS bus_driver_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL,
  drivers_count INTEGER DEFAULT 0,
  meal_type TEXT,
  quantity INTEGER DEFAULT 0,
  estimated_cost NUMERIC DEFAULT 0,
  notes TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 6. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 7. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('present', 'absent')),
  salary_paid NUMERIC DEFAULT 0,
  notes TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 8. PLANNING TABLE
CREATE TABLE IF NOT EXISTS planning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  shift TEXT NOT NULL,
  role TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLS POLICIES (Row Level Security)

-- Enable RLS on all tables
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tajines ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_driver_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning ENABLE ROW LEVEL SECURITY;

-- Create policies for each table (Only the admin can access their own data)
-- Assuming the admin is the only user who can log in (enforced in Supabase Auth or app logic)

CREATE POLICY "Admin can CRUD their own revenues" ON revenues FOR ALL USING (auth.uid() = admin_id);
CREATE POLICY "Admin can CRUD their own expenses" ON expenses FOR ALL USING (auth.uid() = admin_id);
CREATE POLICY "Admin can CRUD their own tajines" ON tajines FOR ALL USING (auth.uid() = admin_id);
CREATE POLICY "Admin can CRUD their own drink_sales" ON drink_sales FOR ALL USING (auth.uid() = admin_id);
CREATE POLICY "Admin can CRUD their own bus_driver_meals" ON bus_driver_meals FOR ALL USING (auth.uid() = admin_id);
CREATE POLICY "Admin can CRUD their own employees" ON employees FOR ALL USING (auth.uid() = admin_id);
CREATE POLICY "Admin can CRUD their own attendance" ON attendance FOR ALL USING (auth.uid() = admin_id);
CREATE POLICY "Admin can CRUD their own planning" ON planning FOR ALL USING (auth.uid() = admin_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_revenues_updated_at BEFORE UPDATE ON revenues FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tajines_updated_at BEFORE UPDATE ON tajines FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_drink_sales_updated_at BEFORE UPDATE ON drink_sales FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bus_driver_meals_updated_at BEFORE UPDATE ON bus_driver_meals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_planning_updated_at BEFORE UPDATE ON planning FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
