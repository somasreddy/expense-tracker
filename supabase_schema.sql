-- Create custom_categories table
create table if not exists public.custom_categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name)
);

-- Enable RLS
alter table public.custom_categories enable row level security;

-- Policies for custom_categories
drop policy if exists "Users can view their own custom categories" on public.custom_categories;
create policy "Users can view their own custom categories"
  on public.custom_categories for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own custom categories" on public.custom_categories;
create policy "Users can insert their own custom categories"
  on public.custom_categories for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own custom categories" on public.custom_categories;
create policy "Users can delete their own custom categories"
  on public.custom_categories for delete
  using (auth.uid() = user_id);

-- Create budgets table (if not already created)
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  category text not null,
  amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category)
);

-- Enable RLS
alter table public.budgets enable row level security;

-- Policies for budgets
drop policy if exists "Users can view their own budgets" on public.budgets;
create policy "Users can view their own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert/update their own budgets" on public.budgets;
create policy "Users can insert/update their own budgets"
  on public.budgets for all
  using (auth.uid() = user_id);
