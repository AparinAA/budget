-- Switch Category.percent (float) to Category.amount (cents, int)
-- Safe/idempotent migration for PostgreSQL

-- 1) Add amount column if missing
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "amount" INTEGER;

-- 2) Backfill amount from percent * income when percent exists and amount is NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Category' AND column_name = 'percent'
  ) THEN
    UPDATE "Category" c
    SET "amount" = ROUND((COALESCE(c."percent", 0) / 100.0) * b."income")
    FROM "Budget" b
    WHERE c."budgetId" = b."id" AND c."amount" IS NULL;
  END IF;
END $$;

-- 3) Ensure NOT NULL with default 0
ALTER TABLE "Category" ALTER COLUMN "amount" SET DEFAULT 0;
UPDATE "Category" SET "amount" = 0 WHERE "amount" IS NULL;
ALTER TABLE "Category" ALTER COLUMN "amount" SET NOT NULL;

-- 4) Drop legacy percent column if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Category' AND column_name = 'percent'
  ) THEN
    ALTER TABLE "Category" DROP COLUMN "percent";
  END IF;
END $$;
