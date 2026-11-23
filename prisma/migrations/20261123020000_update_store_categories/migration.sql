-- Keep the previous category as a tag before mapping to the new storefront groups.
UPDATE "Product"
SET "tags" = CASE
    WHEN "category" = ANY(COALESCE("tags", ARRAY[]::TEXT[])) THEN COALESCE("tags", ARRAY[]::TEXT[])
    ELSE array_append(COALESCE("tags", ARRAY[]::TEXT[]), "category")
  END,
  "category" = CASE
    WHEN "category" IN ('men-un-stitch', 'men-stitch') THEN 'men'
    WHEN "category" IN ('women-un-stitch', 'women-stitch') THEN 'women'
    WHEN "category" IN ('kids-baby-boys', 'kids-baby-girls') THEN 'kids'
    ELSE 'accessories'
  END
WHERE "category" IN (
  'men-un-stitch', 'men-stitch', 'women-un-stitch', 'women-stitch',
  'kids-baby-boys', 'kids-baby-girls', 'men-watches', 'men-perfumes',
  'men-cufflinks', 'women-watches', 'women-perfumes', 'women-cufflinks'
);
