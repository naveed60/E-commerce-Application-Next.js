-- Support the bounded storefront and category queries, including stable paging.
CREATE INDEX "Product_archived_category_createdAt_id_idx" ON "Product"("archived", "category", "createdAt", "id");
CREATE INDEX "Product_archived_createdAt_id_idx" ON "Product"("archived", "createdAt", "id");
