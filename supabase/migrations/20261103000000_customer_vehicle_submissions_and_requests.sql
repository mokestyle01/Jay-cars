create table if not exists public.customer_vehicle_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  make text not null check (char_length(make) between 1 and 80),
  model text not null check (char_length(model) between 1 and 80),
  year integer not null check (year between 1886 and 2100),
  notes text check (notes is null or char_length(notes) <= 2000),
  image_paths text[] not null default '{}'
    check (coalesce(array_length(image_paths, 1), 0) between 1 and 6),
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'contacted')),
  created_at timestamptz not null default now()
);

create index if not exists customer_vehicle_submissions_user_created_idx
  on public.customer_vehicle_submissions (user_id, created_at desc);

alter table public.customer_vehicle_submissions enable row level security;

grant select, insert on public.customer_vehicle_submissions to authenticated;

drop policy if exists "Customers can view their vehicle submissions"
  on public.customer_vehicle_submissions;
create policy "Customers can view their vehicle submissions"
  on public.customer_vehicle_submissions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Customers can submit their own vehicles"
  on public.customer_vehicle_submissions;
create policy "Customers can submit their own vehicles"
  on public.customer_vehicle_submissions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending');

create table if not exists public.customer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  request_type text not null check (request_type in ('order', 'consultation')),
  vehicle_id text,
  vehicle_name text,
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 30),
  budget text check (budget is null or char_length(budget) <= 100),
  intended_use text check (intended_use is null or char_length(intended_use) <= 250),
  message text check (message is null or char_length(message) <= 2000),
  check (
    request_type <> 'order'
    or (vehicle_id is not null and vehicle_name is not null)
  ),
  created_at timestamptz not null default now()
);

create index if not exists customer_requests_user_created_idx
  on public.customer_requests (user_id, created_at desc);

alter table public.customer_requests enable row level security;

grant select, insert on public.customer_requests to authenticated;

drop policy if exists "Customers can view their own requests" on public.customer_requests;
create policy "Customers can view their own requests"
  on public.customer_requests
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Customers can create their own requests" on public.customer_requests;
create policy "Customers can create their own requests"
  on public.customer_requests
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-submissions',
  'vehicle-submissions',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Customers can view their own vehicle photos" on storage.objects;
create policy "Customers can view their own vehicle photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'vehicle-submissions'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Customers can upload their own vehicle photos" on storage.objects;
create policy "Customers can upload their own vehicle photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'vehicle-submissions'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Customers can remove their own vehicle photos" on storage.objects;
create policy "Customers can remove their own vehicle photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'vehicle-submissions'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
