-- Update existing categories to have proper sortOrder based on createdAt
WITH ranked_categories AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY "budgetId" ORDER BY "createdAt" ASC) - 1 as new_order
  FROM "Category"
)
UPDATE "Category"
SET "sortOrder" = ranked_categories.new_order
FROM ranked_categories
WHERE "Category".id = ranked_categories.id;
