create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'Member'
    check (role in ('Member', 'Admin', 'Superadmin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists role text not null default 'Member';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    'Member',
    now()
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, email, full_name, role)
select id, email, coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', ''), 'Member'
from auth.users
on conflict (id) do nothing;

update public.profiles profiles
set email = users.email,
    updated_at = now()
from auth.users users
where users.id = profiles.id;

create or replace function public.sync_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email,
      full_name = coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
      updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, raw_user_meta_data on auth.users
  for each row execute function public.sync_user_profile();

create or replace function public.has_staff_role()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role in ('Admin', 'Superadmin')
  );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'Superadmin'
  );
$$;

create or replace function public.set_profile_role(target_user_id uuid, target_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_superadmin() then
    raise exception 'Only a superadmin can change user roles';
  end if;
  if target_role is null or target_role not in ('Member', 'Admin', 'Superadmin') then
    raise exception 'Invalid user role';
  end if;

  update public.profiles
  set role = target_role, updated_at = now()
  where id = target_user_id;

  if not found then
    raise exception 'Profile not found';
  end if;
end;
$$;
grant execute on function public.set_profile_role(uuid, text) to authenticated;
revoke all on function public.set_profile_role(uuid, text) from public, anon;
grant execute on function public.has_staff_role() to anon, authenticated;
grant execute on function public.is_superadmin() to authenticated;
revoke all on function public.is_superadmin() from public, anon;

alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('Member', 'Admin', 'Superadmin'));
  end if;
end;
$$;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Staff can view profiles" on public.profiles;
create policy "Staff can view profiles"
  on public.profiles for select to authenticated
  using ((select public.has_staff_role()));

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (char_length(brand) between 1 and 80),
  name text not null check (char_length(name) between 1 and 120),
  model text not null check (char_length(model) between 1 and 120),
  year integer not null check (year between 1886 and 2100),
  price numeric(14, 2) not null check (price >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  mileage integer not null default 0 check (mileage >= 0),
  transmission text not null,
  fuel_type text not null,
  engine_specs jsonb not null default '{}'::jsonb,
  exterior_details text not null default '',
  interior_details text not null default '',
  description text not null default '',
  features text[] not null default '{}',
  specifications jsonb not null default '{}'::jsonb,
  availability text not null default 'available'
    check (availability in ('available', 'reserved', 'sold')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cars_public_search_idx
  on public.cars (availability, featured desc, created_at desc);
create index if not exists cars_brand_year_idx on public.cars (brand, year);

create table if not exists public.car_images (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars (id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists car_images_car_order_idx
  on public.car_images (car_id, sort_order, created_at);

create table if not exists public.car_videos (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars (id) on delete cascade,
  storage_path text not null unique,
  title text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists car_videos_car_idx on public.car_videos (car_id);

create table if not exists public.car_enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  car_id uuid references public.cars (id) on delete set null,
  car_name text not null,
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text not null check (char_length(phone) between 1 and 30),
  subject text not null check (char_length(subject) between 1 and 120),
  message text not null check (char_length(message) between 1 and 3000),
  status text not null default 'Pending'
    check (status in ('Pending', 'Contacted', 'Completed', 'Cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists car_enquiries_user_created_idx
  on public.car_enquiries (user_id, created_at desc);
create index if not exists car_enquiries_status_idx on public.car_enquiries (status);

create table if not exists public.car_orders (
  id uuid primary key default gen_random_uuid(),
  order_reference text not null unique default
    ('JAY-' || to_char(now() at time zone 'utc', 'YYYYMMDD') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid not null references auth.users (id) on delete cascade,
  car_id uuid references public.cars (id) on delete set null,
  car_name text not null,
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text not null check (char_length(phone) between 1 and 30),
  country text not null check (char_length(country) between 1 and 100),
  city text not null check (char_length(city) between 1 and 100),
  fulfilment text not null check (fulfilment in ('delivery', 'collection')),
  additional_information text not null default ''
    check (char_length(additional_information) <= 3000),
  status text not null default 'Pending'
    check (status in ('Pending', 'Under Review', 'Contacted', 'Approved', 'Completed', 'Cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists car_orders_user_created_idx
  on public.car_orders (user_id, created_at desc);
create index if not exists car_orders_status_idx on public.car_orders (status);

alter table public.cars enable row level security;
alter table public.car_images enable row level security;
alter table public.car_videos enable row level security;
alter table public.car_enquiries enable row level security;
alter table public.car_orders enable row level security;

grant select on public.cars, public.car_images, public.car_videos to anon, authenticated;
grant insert, update, delete on public.cars, public.car_images, public.car_videos to authenticated;
grant select, insert, update on public.car_enquiries, public.car_orders to authenticated;

create policy "Anyone can view available cars"
  on public.cars for select to anon, authenticated using (availability <> 'sold' or (select public.has_staff_role()));
create policy "Staff can manage cars"
  on public.cars for all to authenticated
  using ((select public.has_staff_role()))
  with check ((select public.has_staff_role()));

create policy "Anyone can view images of public cars"
  on public.car_images for select to anon, authenticated
  using (exists (
    select 1 from public.cars
    where cars.id = car_images.car_id
      and (cars.availability <> 'sold' or (select public.has_staff_role()))
  ));
create policy "Staff can manage car images"
  on public.car_images for all to authenticated
  using ((select public.has_staff_role()))
  with check ((select public.has_staff_role()));

create policy "Anyone can view videos of public cars"
  on public.car_videos for select to anon, authenticated
  using (exists (
    select 1 from public.cars
    where cars.id = car_videos.car_id
      and (cars.availability <> 'sold' or (select public.has_staff_role()))
  ));
create policy "Staff can manage car videos"
  on public.car_videos for all to authenticated
  using ((select public.has_staff_role()))
  with check ((select public.has_staff_role()));

create policy "Customers can view their enquiries"
  on public.car_enquiries for select to authenticated
  using ((select auth.uid()) = user_id or (select public.has_staff_role()));
create policy "Customers can create their enquiries"
  on public.car_enquiries for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'Pending'
    and exists (
      select 1 from public.cars
      where cars.id = car_enquiries.car_id and cars.availability <> 'sold'
    )
  );
create policy "Staff can update enquiries"
  on public.car_enquiries for update to authenticated
  using ((select public.has_staff_role()))
  with check ((select public.has_staff_role()));

create policy "Customers can view their orders"
  on public.car_orders for select to authenticated
  using ((select auth.uid()) = user_id or (select public.has_staff_role()));
create policy "Customers can create their orders"
  on public.car_orders for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'Pending'
    and exists (
      select 1 from public.cars
      where cars.id = car_orders.car_id and cars.availability <> 'sold'
    )
  );
create policy "Staff can update orders"
  on public.car_orders for update to authenticated
  using ((select public.has_staff_role()))
  with check ((select public.has_staff_role()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('vehicle-images', 'vehicle-images', true, 12582912, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('vehicle-videos', 'vehicle-videos', true, 52428800, array['video/mp4', 'video/webm'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can view marketplace media"
  on storage.objects for select to anon, authenticated
  using (bucket_id in ('vehicle-images', 'vehicle-videos'));
create policy "Staff can upload marketplace media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('vehicle-images', 'vehicle-videos')
    and (select public.has_staff_role())
  );
create policy "Staff can update marketplace media"
  on storage.objects for update to authenticated
  using (bucket_id in ('vehicle-images', 'vehicle-videos') and (select public.has_staff_role()))
  with check (bucket_id in ('vehicle-images', 'vehicle-videos') and (select public.has_staff_role()));
create policy "Staff can delete marketplace media"
  on storage.objects for delete to authenticated
  using (bucket_id in ('vehicle-images', 'vehicle-videos') and (select public.has_staff_role()));

revoke update (role) on public.profiles from authenticated;
