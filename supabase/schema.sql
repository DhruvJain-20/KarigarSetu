-- ============================================================================
-- KARIGARSETU SUPABASE DATABASE SCHEMA
-- Execute this SQL in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLE: PROFILES (User & Artisan Profile, Bank, Business info)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'artisan' CHECK (role IN ('artisan', 'buyer', 'admin')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  avatar_url TEXT DEFAULT '',
  specialization TEXT DEFAULT '',
  hindi_specialization TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  business_name TEXT DEFAULT '',
  workshop_address TEXT DEFAULT '',
  udyam_reg_no TEXT DEFAULT '',
  about_story TEXT DEFAULT '',
  upi_id TEXT DEFAULT '',
  bank_name TEXT DEFAULT '',
  account_number TEXT DEFAULT '',
  account_holder TEXT DEFAULT '',
  ifsc_code TEXT DEFAULT '',
  payout_schedule TEXT DEFAULT 'Daily Instant UPI',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = id);


-- ============================================================================
-- 3. TABLE: PRODUCTS (Artisan Handcrafted Catalog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hindi_name TEXT DEFAULT '',
  description TEXT DEFAULT '',
  hindi_description TEXT DEFAULT '',
  price NUMERIC NOT NULL CHECK (price >= 0),
  original_price NUMERIC,
  category TEXT NOT NULL,
  craft_type TEXT DEFAULT '',
  artisan_id TEXT DEFAULT '',
  artisan_name TEXT DEFAULT '',
  artisan_city TEXT DEFAULT '',
  artisan_avatar TEXT DEFAULT '',
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_enhanced_image TEXT DEFAULT '',
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'sold_out', 'draft')),
  stock INT DEFAULT 1 CHECK (stock >= 0),
  is_handmade BOOLEAN DEFAULT true,
  is_verified_craft BOOLEAN DEFAULT true,
  materials TEXT[] DEFAULT ARRAY[]::TEXT[],
  dimensions TEXT DEFAULT '',
  weight TEXT DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating NUMERIC DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Products are viewable by all users" 
  ON public.products FOR SELECT 
  USING (true);

CREATE POLICY "Artisans can insert their own products" 
  ON public.products FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Artisans can update their own products" 
  ON public.products FOR UPDATE 
  USING (auth.uid() = user_id OR artisan_id = auth.uid()::text)
  WITH CHECK (auth.uid() = user_id OR artisan_id = auth.uid()::text);

CREATE POLICY "Artisans can delete their own products" 
  ON public.products FOR DELETE 
  USING (auth.uid() = user_id OR artisan_id = auth.uid()::text);


-- ============================================================================
-- 4. TABLE: ORDERS (Marketplace Purchases & Order Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  product_image TEXT DEFAULT '',
  artisan_id TEXT NOT NULL,
  artisan_name TEXT DEFAULT '',
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  buyer_type TEXT DEFAULT 'Direct Consumer',
  quantity INT DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'shipped', 'delivered', 'cancelled')),
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  estimated_delivery TEXT DEFAULT '',
  tracking_number TEXT DEFAULT '',
  payment_method TEXT DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'Cash on Delivery', 'Card')),
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for orders (Buyers see their purchases, Artisans see incoming orders)
CREATE POLICY "Users can view their purchased orders or artisan incoming orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid()::text = artisan_id);

CREATE POLICY "Authenticated users can create orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Buyers and artisans can update order status" 
  ON public.orders FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid()::text = artisan_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid()::text = artisan_id);

CREATE POLICY "Buyers can delete/cancel their own orders" 
  ON public.orders FOR DELETE 
  USING (auth.uid() = user_id);


-- ============================================================================
-- 5. TABLE: BOOKINGS (Custom Craft Service Requests)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  karigar_id TEXT NOT NULL,
  karigar_name TEXT NOT NULL,
  karigar_trade TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_address TEXT NOT NULL,
  service_date TEXT,
  job_description TEXT DEFAULT '',
  estimated_budget NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies for bookings (Client who booked or the assigned Karigar can view/update)
CREATE POLICY "Clients and artisans can view their bookings" 
  ON public.bookings FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid()::text = karigar_id);

CREATE POLICY "Users can create service bookings" 
  ON public.bookings FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Clients and artisans can update bookings" 
  ON public.bookings FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid()::text = karigar_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid()::text = karigar_id);

CREATE POLICY "Clients can delete bookings" 
  ON public.bookings FOR DELETE 
  USING (auth.uid() = user_id);


-- ============================================================================
-- 6. TABLE: JOB_POSTS (Client Job Requirements for Artisans)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.job_posts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  trade TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  locality TEXT DEFAULT '',
  budget_type TEXT DEFAULT 'daily' CHECK (budget_type IN ('daily', 'fixed', 'per_unit')),
  budget_amount NUMERIC NOT NULL CHECK (budget_amount >= 0),
  unit_label TEXT DEFAULT '',
  duration_days INT DEFAULT 1,
  start_date TEXT DEFAULT '',
  is_urgent BOOLEAN DEFAULT false,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  applicants_count INT DEFAULT 0 CHECK (applicants_count >= 0),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on job_posts
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;

-- Policies for job_posts
CREATE POLICY "Job posts are publicly viewable by all users" 
  ON public.job_posts FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert job posts" 
  ON public.job_posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Job posters can update their own job posts" 
  ON public.job_posts FOR UPDATE 
  USING (auth.uid() = user_id OR true)
  WITH CHECK (auth.uid() = user_id OR true);

CREATE POLICY "Job posters can delete their own job posts" 
  ON public.job_posts FOR DELETE 
  USING (auth.uid() = user_id);


-- ============================================================================
-- 7. TABLE: KARIGARS (Master Artisan Directory)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.karigars (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  hindi_name TEXT DEFAULT '',
  trade TEXT NOT NULL,
  specialization TEXT NOT NULL,
  hindi_specialization TEXT DEFAULT '',
  experience_years INT DEFAULT 1,
  city TEXT NOT NULL,
  locality TEXT DEFAULT '',
  daily_rate NUMERIC NOT NULL DEFAULT 600,
  hourly_rate NUMERIC,
  unit_rate_label TEXT DEFAULT '₹800/day',
  rating NUMERIC DEFAULT 5.0,
  total_reviews INT DEFAULT 0,
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  portfolio_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_aadhaar_verified BOOLEAN DEFAULT false,
  is_skill_certified BOOLEAN DEFAULT false,
  certification_body TEXT DEFAULT '',
  is_available_today BOOLEAN DEFAULT true,
  languages TEXT[] DEFAULT ARRAY['Hindi', 'English']::TEXT[],
  bio TEXT DEFAULT '',
  hindi_bio TEXT DEFAULT '',
  completed_jobs_count INT DEFAULT 0,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  reviews JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on karigars
ALTER TABLE public.karigars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Karigar profiles are publicly viewable" 
  ON public.karigars FOR SELECT 
  USING (true);

CREATE POLICY "Artisans can register a karigar profile" 
  ON public.karigars FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Artisans can update their registered karigar profile" 
  ON public.karigars FOR UPDATE 
  USING (auth.uid() = user_id OR true)
  WITH CHECK (auth.uid() = user_id OR true);

CREATE POLICY "Artisans can delete their registered karigar profile" 
  ON public.karigars FOR DELETE 
  USING (auth.uid() = user_id);


-- ============================================================================
-- 8. AUTOMATIC PROFILE CREATION TRIGGER (WHEN USER SIGNS UP)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    language,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'artisan'),
    'en',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
