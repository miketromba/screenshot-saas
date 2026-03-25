-- Supabase Profiles Sync Triggers
-- Apply via Supabase SQL Editor or as a custom Drizzle migration
-- Syncs public.profiles with auth.users on signup and updates

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    email_confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at,
    NEW.last_sign_in_at,
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    email = NEW.email,
    email_confirmed_at = NEW.email_confirmed_at,
    last_sign_in_at = NEW.last_sign_in_at,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, email_confirmed_at, last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();

-- Backfill: create profiles for any existing auth users (idempotent)
INSERT INTO public.profiles (id, email, email_confirmed_at, last_sign_in_at, created_at, updated_at)
SELECT
  id, email, email_confirmed_at, last_sign_in_at, created_at, updated_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  last_sign_in_at = EXCLUDED.last_sign_in_at,
  updated_at = CURRENT_TIMESTAMP;
