-- Employees table (supports both team members and independent employees)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  position TEXT,
  email TEXT,
  phone TEXT,
  base_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_frequency TEXT NOT NULL DEFAULT 'monthly',
  hire_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage employees"
  ON public.employees FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_employees_user_outlet ON public.employees(user_id, outlet_id);

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Salary payments table
CREATE TABLE public.salary_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  outlet_id UUID NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  payslip_number TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  base_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  bonus_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  advance_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  deductions_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Espèces',
  status TEXT NOT NULL DEFAULT 'pending',
  paid_date DATE,
  notes TEXT,
  transaction_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, payslip_number)
);

ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage salary payments"
  ON public.salary_payments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_salary_payments_user_outlet ON public.salary_payments(user_id, outlet_id);
CREATE INDEX idx_salary_payments_employee ON public.salary_payments(employee_id);

CREATE TRIGGER update_salary_payments_updated_at
  BEFORE UPDATE ON public.salary_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate payslip number
CREATE OR REPLACE FUNCTION public.generate_payslip_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('generate_payslip_number'));
  SELECT COALESCE(MAX(CAST(SUBSTRING(payslip_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.salary_payments
  WHERE payslip_number ~ '^PAY-[0-9]+$';
  RETURN 'PAY-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;

-- Trigger: when salary payment becomes 'paid', create expense transaction
CREATE OR REPLACE FUNCTION public.create_transaction_for_paid_salary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emp_name TEXT;
  new_tx_id UUID;
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'paid')
     OR (TG_OP = 'UPDATE' AND COALESCE(OLD.status,'') <> 'paid' AND NEW.status = 'paid') THEN

    IF NEW.transaction_id IS NOT NULL THEN
      RETURN NEW;
    END IF;

    SELECT full_name INTO emp_name FROM public.employees WHERE id = NEW.employee_id;

    INSERT INTO public.transactions (
      user_id, outlet_id, title, amount, type, category, status, date,
      description, payment_method
    ) VALUES (
      NEW.user_id, NEW.outlet_id,
      CONCAT('Salaire ', NEW.payslip_number, ' - ', COALESCE(emp_name, 'Employé')),
      NEW.net_amount, 'expense', 'salaire', 'completed',
      COALESCE(NEW.paid_date, CURRENT_DATE),
      CONCAT('Paiement salaire période ', NEW.period_start, ' au ', NEW.period_end),
      COALESCE(NEW.payment_method, 'Espèces')
    )
    RETURNING id INTO new_tx_id;

    NEW.transaction_id := new_tx_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_transaction_for_paid_salary
  BEFORE INSERT OR UPDATE ON public.salary_payments
  FOR EACH ROW EXECUTE FUNCTION public.create_transaction_for_paid_salary();