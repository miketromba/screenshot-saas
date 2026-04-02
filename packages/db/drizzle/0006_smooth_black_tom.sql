-- Migrate screenshot_cache from DB-stored image blobs to Supabase Storage pointers.
-- Adds per-user scoping and storage metadata; removes inline image data.

-- 1. Drop all existing cache rows (they reference inline imageData which is being removed)
TRUNCATE TABLE "screenshot_cache";

-- 2. Drop the old image_data column
ALTER TABLE "screenshot_cache" DROP COLUMN IF EXISTS "image_data";

-- 3. Add new columns
ALTER TABLE "screenshot_cache"
  ADD COLUMN "user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  ADD COLUMN "storage_path" text NOT NULL DEFAULT '',
  ADD COLUMN "image_size_bytes" integer;

-- 4. Remove the default on storage_path now that column exists
ALTER TABLE "screenshot_cache" ALTER COLUMN "storage_path" DROP DEFAULT;

-- 5. Add user_id index for per-user cache lookups
CREATE INDEX IF NOT EXISTS "screenshot_cache_user_idx" ON "screenshot_cache" ("user_id");
