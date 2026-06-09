-- Add composite indexes for dashboard and detail-page query patterns.
CREATE INDEX "Item_userId_typeId_updatedAt_idx" ON "Item"("userId", "typeId", "updatedAt");
CREATE INDEX "Item_userId_collectionId_updatedAt_idx" ON "Item"("userId", "collectionId", "updatedAt");
CREATE INDEX "Item_userId_isPinned_updatedAt_idx" ON "Item"("userId", "isPinned", "updatedAt");
CREATE INDEX "Item_userId_isFavorite_idx" ON "Item"("userId", "isFavorite");
CREATE INDEX "Collection_userId_createdAt_idx" ON "Collection"("userId", "createdAt");
CREATE INDEX "Collection_userId_isFavorite_idx" ON "Collection"("userId", "isFavorite");
