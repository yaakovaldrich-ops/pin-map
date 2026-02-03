-- Run this in your Supabase SQL editor to set up the database

create table if not exists pins (
  id uuid default gen_random_uuid() primary key,
  lat double precision not null,
  lng double precision not null,
  title text not null,
  description text default '',
  category text not null,
  created_at timestamptz default now(),
  visitor_id text not null
);

create table if not exists site_config (
  id uuid default gen_random_uuid() primary key,
  site_name text default 'Pin Map',
  theme jsonb default '{"primary_color":"#3b82f6","background_color":"#ffffff","font":"Inter","dark_mode":false}'::jsonb,
  legend jsonb default '[{"name":"Default","color":"#3b82f6","shape":"circle"}]'::jsonb
);

create table if not exists page_views (
  id uuid default gen_random_uuid() primary key,
  timestamp timestamptz default now(),
  path text not null,
  visitor_hash text not null
);

-- Insert default config row
insert into site_config (site_name) values ('Pin Map')
on conflict do nothing;

-- Enable RLS
alter table pins enable row level security;
alter table site_config enable row level security;
alter table page_views enable row level security;

-- Policies: anyone can read pins and config, anyone can insert pins and page_views
create policy "Anyone can read pins" on pins for select using (true);
create policy "Anyone can insert pins" on pins for insert with check (true);
create policy "Anyone can read config" on site_config for select using (true);
create policy "Anyone can insert views" on page_views for insert with check (true);
create policy "Anyone can read views" on page_views for select using (true);

-- For admin operations (update/delete), use the service role key server-side
-- or create policies that check a custom claim
create policy "Anyone can update config" on site_config for update using (true);
create policy "Anyone can delete pins" on pins for delete using (true);

-- =============================================
-- MIGRATION: Add event support to pins table
-- Run this section if you already have the tables above
-- =============================================

ALTER TABLE pins
  ADD COLUMN IF NOT EXISTS start_date timestamptz,
  ADD COLUMN IF NOT EXISTS end_date timestamptz,
  ADD COLUMN IF NOT EXISTS address text;

ALTER TABLE pins
  ALTER COLUMN lat DROP NOT NULL,
  ALTER COLUMN lng DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pins_start_date ON pins(start_date);
CREATE INDEX IF NOT EXISTS idx_pins_end_date ON pins(end_date);
