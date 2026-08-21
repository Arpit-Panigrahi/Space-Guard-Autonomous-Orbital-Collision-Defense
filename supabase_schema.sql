-- =========================================================================
-- 🛰️ SPACE-GUARD SUPABASE DATABASE SCHEMA
-- =========================================================================
-- Execute this script in your Supabase Dashboard SQL Editor
-- (https://supabase.com/dashboard/project/_/sql)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Satellite TLE Catalog Table
CREATE TABLE IF NOT EXISTS public.tle_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    norad_id INTEGER UNIQUE NOT NULL,
    satellite_name TEXT NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT NOT NULL,
    epoch_utc TIMESTAMPTZ NOT NULL,
    inclination_deg DOUBLE PRECISION,
    eccentricity DOUBLE PRECISION,
    mean_motion DOUBLE PRECISION,
    altitude_km DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by NORAD ID
CREATE INDEX IF NOT EXISTS idx_tle_norad ON public.tle_catalog(norad_id);

-- 3. Conjunction Events Table
CREATE TABLE IF NOT EXISTS public.conjunction_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID,
    target_id TEXT NOT NULL,
    chaser_id TEXT NOT NULL,
    tca_utc TIMESTAMPTZ NOT NULL,
    miss_distance_km DOUBLE PRECISION NOT NULL,
    relative_velocity_km_s DOUBLE PRECISION,
    pc DOUBLE PRECISION NOT NULL,
    risk_tier TEXT NOT NULL CHECK (risk_tier IN ('Critical', 'High', 'Moderate', 'Low', 'Nominal')),
    ml_prescreen_score DOUBLE PRECISION,
    is_historical_benchmark BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for high-priority risk queries
CREATE INDEX IF NOT EXISTS idx_conjunction_risk ON public.conjunction_events(risk_tier, tca_utc);
CREATE INDEX IF NOT EXISTS idx_conjunction_tca ON public.conjunction_events(tca_utc);

-- 4. Maneuver Planning Logs Table
CREATE TABLE IF NOT EXISTS public.maneuver_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conjunction_id UUID REFERENCES public.conjunction_events(id) ON DELETE SET NULL,
    target_satellite TEXT NOT NULL,
    delta_v_m_s DOUBLE PRECISION NOT NULL,
    burn_lead_time_hours DOUBLE PRECISION NOT NULL,
    baseline_miss_distance_km DOUBLE PRECISION NOT NULL,
    projected_miss_distance_km DOUBLE PRECISION NOT NULL,
    separation_gain_km DOUBLE PRECISION NOT NULL,
    burn_direction_r DOUBLE PRECISION,
    burn_direction_t DOUBLE PRECISION,
    burn_direction_n DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.tle_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conjunction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maneuver_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to satellite catalog and conjunction data
CREATE POLICY "Public Read Access on TLE Catalog" 
    ON public.tle_catalog FOR SELECT USING (true);

CREATE POLICY "Public Read Access on Conjunction Events" 
    ON public.conjunction_events FOR SELECT USING (true);

CREATE POLICY "Public Read Access on Maneuver Logs" 
    ON public.maneuver_logs FOR SELECT USING (true);

-- Allow authenticated/service-role insertion (from Python Backend)
CREATE POLICY "Service Role Full Access on TLE Catalog" 
    ON public.tle_catalog FOR ALL 
    USING (auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Service Role Full Access on Conjunction Events" 
    ON public.conjunction_events FOR ALL 
    USING (auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Service Role Full Access on Maneuver Logs" 
    ON public.maneuver_logs FOR ALL 
    USING (auth.role() = 'service_role' OR auth.role() = 'anon');

-- 6. Enable Realtime Broadcast for Live Mission Control Updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.conjunction_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maneuver_logs;

-- Schema setup completed successfully.
