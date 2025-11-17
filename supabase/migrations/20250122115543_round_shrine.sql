/*
  # Initial Schema Setup for GIGEO Enterprises Billing System

  1. New Tables
    - `profiles`
      - Stores admin user profile information
      - Links to Supabase auth.users
    - `bills`
      - Stores bill/invoice information
      - Auto-incrementing invoice numbers
      - Tracks payment status and details
    - `bill_items`
      - Stores individual line items for each bill
    - `customers`
      - Stores customer information
      - Optional address details

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  company_name text DEFAULT 'GIGEO Enterprises',
  company_address text,
  gstin text,
  signature_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile_number text,
  email text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  customer_id uuid REFERENCES customers(id),
  sub_total numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment_mode text NOT NULL,
  amount_received numeric(10,2) NOT NULL DEFAULT 0,
  balance numeric(10,2) NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read bills"
  ON bills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert bills"
  ON bills FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create bill_items table
CREATE TABLE IF NOT EXISTS bill_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid REFERENCES bills(id),
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read bill items"
  ON bill_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert bill items"
  ON bill_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  last_number integer;
  new_number text;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(invoice_number, '[^0-9]', '', 'g'), '')), '0')::integer
  INTO last_number
  FROM bills;
  
  new_number := LPAD((last_number + 1)::text, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update bill totals
CREATE OR REPLACE FUNCTION update_bill_totals()
RETURNS trigger AS $$
BEGIN
  UPDATE bills
  SET 
    sub_total = (
      SELECT COALESCE(SUM(amount), 0)
      FROM bill_items
      WHERE bill_id = NEW.bill_id
    ),
    total = (
      SELECT COALESCE(SUM(amount), 0)
      FROM bill_items
      WHERE bill_id = NEW.bill_id
    ) - bills.discount,
    balance = (
      SELECT COALESCE(SUM(amount), 0)
      FROM bill_items
      WHERE bill_id = NEW.bill_id
    ) - bills.discount - bills.amount_received
  WHERE id = NEW.bill_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating bill totals
CREATE TRIGGER update_bill_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON bill_items
FOR EACH ROW
EXECUTE FUNCTION update_bill_totals();