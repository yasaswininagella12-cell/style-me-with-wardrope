-- AlterTable
ALTER TABLE "SavedLook" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WardrobeItem" ADD COLUMN     "careInstructions" TEXT,
ADD COLUMN     "careIntervalDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "purchasePrice" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "OutfitPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outfitId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "note" TEXT,
    "isWorn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutfitPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WearLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wardrobeItemId" TEXT NOT NULL,
    "wornAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "note" TEXT,

    CONSTRAINT "WearLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wardrobeItemId" TEXT NOT NULL,
    "careType" TEXT NOT NULL,
    "caredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextDueAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "CareLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "estimatedPrice" DOUBLE PRECISION,
    "priority" TEXT NOT NULL DEFAULT 'nice-to-have',
    "status" TEXT NOT NULL DEFAULT 'planned',
    "link" TEXT,
    "imageUrl" TEXT,
    "note" TEXT,
    "purchasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthlyLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LookLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "savedLookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LookLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LookComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "savedLookId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LookComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutfitPlan_userId_date_idx" ON "OutfitPlan"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "OutfitPlan_userId_outfitId_date_key" ON "OutfitPlan"("userId", "outfitId", "date");

-- CreateIndex
CREATE INDEX "WearLog_userId_wornAt_idx" ON "WearLog"("userId", "wornAt");

-- CreateIndex
CREATE INDEX "WearLog_wardrobeItemId_idx" ON "WearLog"("wardrobeItemId");

-- CreateIndex
CREATE INDEX "CareLog_userId_caredAt_idx" ON "CareLog"("userId", "caredAt");

-- CreateIndex
CREATE INDEX "CareLog_wardrobeItemId_idx" ON "CareLog"("wardrobeItemId");

-- CreateIndex
CREATE INDEX "WishlistItem_userId_idx" ON "WishlistItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_key" ON "Budget"("userId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "LookLike_savedLookId_idx" ON "LookLike"("savedLookId");

-- CreateIndex
CREATE UNIQUE INDEX "LookLike_userId_savedLookId_key" ON "LookLike"("userId", "savedLookId");

-- CreateIndex
CREATE INDEX "LookComment_savedLookId_idx" ON "LookComment"("savedLookId");

-- CreateIndex
CREATE INDEX "LookComment_userId_idx" ON "LookComment"("userId");

-- AddForeignKey
ALTER TABLE "OutfitPlan" ADD CONSTRAINT "OutfitPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitPlan" ADD CONSTRAINT "OutfitPlan_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WearLog" ADD CONSTRAINT "WearLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WearLog" ADD CONSTRAINT "WearLog_wardrobeItemId_fkey" FOREIGN KEY ("wardrobeItemId") REFERENCES "WardrobeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareLog" ADD CONSTRAINT "CareLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareLog" ADD CONSTRAINT "CareLog_wardrobeItemId_fkey" FOREIGN KEY ("wardrobeItemId") REFERENCES "WardrobeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LookLike" ADD CONSTRAINT "LookLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LookLike" ADD CONSTRAINT "LookLike_savedLookId_fkey" FOREIGN KEY ("savedLookId") REFERENCES "SavedLook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LookComment" ADD CONSTRAINT "LookComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LookComment" ADD CONSTRAINT "LookComment_savedLookId_fkey" FOREIGN KEY ("savedLookId") REFERENCES "SavedLook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
