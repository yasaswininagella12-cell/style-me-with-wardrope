-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "preferredStyle" TEXT,
    "preferredColorPalette" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "WardrobeItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "secondaryColor" TEXT,
    "pattern" TEXT,
    "material" TEXT,
    "occasion" TEXT,
    "season" TEXT,
    "style" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WardrobeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outfit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "occasion" TEXT,
    "style" TEXT,
    "lookData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outfit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutfitItem" (
    "id" TEXT NOT NULL,
    "outfitId" TEXT NOT NULL,
    "wardrobeItemId" TEXT NOT NULL,

    CONSTRAINT "OutfitItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedLook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outfitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "lookData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedLook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "savedLookId" TEXT,
    "trendId" TEXT,
    "wardrobeItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trend" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "style" TEXT,
    "occasion" TEXT,
    "season" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendItem" (
    "id" TEXT NOT NULL,
    "trendId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detail" TEXT,

    CONSTRAINT "TrendItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jewelry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT,
    "material" TEXT,
    "style" TEXT,
    "occasion" TEXT,
    "imageUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jewelry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accessory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT,
    "style" TEXT,
    "occasion" TEXT,
    "imageUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Accessory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StyleRecommendation" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "color" TEXT,
    "style" TEXT,
    "occasion" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StyleRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColorMatch" (
    "id" TEXT NOT NULL,
    "baseColor" TEXT NOT NULL,
    "matchColor" TEXT NOT NULL,
    "metalTone" TEXT,
    "category" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColorMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "WardrobeItem_userId_idx" ON "WardrobeItem"("userId");

-- CreateIndex
CREATE INDEX "WardrobeItem_category_idx" ON "WardrobeItem"("category");

-- CreateIndex
CREATE INDEX "WardrobeItem_color_idx" ON "WardrobeItem"("color");

-- CreateIndex
CREATE INDEX "WardrobeItem_style_idx" ON "WardrobeItem"("style");

-- CreateIndex
CREATE INDEX "Outfit_userId_idx" ON "Outfit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OutfitItem_outfitId_wardrobeItemId_key" ON "OutfitItem"("outfitId", "wardrobeItemId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedLook_outfitId_key" ON "SavedLook"("outfitId");

-- CreateIndex
CREATE INDEX "SavedLook_userId_idx" ON "SavedLook"("userId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_savedLookId_trendId_wardrobeItemId_key" ON "Favorite"("userId", "savedLookId", "trendId", "wardrobeItemId");

-- CreateIndex
CREATE INDEX "Trend_style_idx" ON "Trend"("style");

-- CreateIndex
CREATE INDEX "TrendItem_trendId_idx" ON "TrendItem"("trendId");

-- CreateIndex
CREATE INDEX "Jewelry_type_idx" ON "Jewelry"("type");

-- CreateIndex
CREATE INDEX "Jewelry_style_idx" ON "Jewelry"("style");

-- CreateIndex
CREATE INDEX "Jewelry_occasion_idx" ON "Jewelry"("occasion");

-- CreateIndex
CREATE INDEX "Accessory_type_idx" ON "Accessory"("type");

-- CreateIndex
CREATE INDEX "Accessory_style_idx" ON "Accessory"("style");

-- CreateIndex
CREATE INDEX "Accessory_occasion_idx" ON "Accessory"("occasion");

-- CreateIndex
CREATE INDEX "StyleRecommendation_category_idx" ON "StyleRecommendation"("category");

-- CreateIndex
CREATE INDEX "StyleRecommendation_style_idx" ON "StyleRecommendation"("style");

-- CreateIndex
CREATE INDEX "StyleRecommendation_occasion_idx" ON "StyleRecommendation"("occasion");

-- CreateIndex
CREATE INDEX "ColorMatch_baseColor_idx" ON "ColorMatch"("baseColor");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WardrobeItem" ADD CONSTRAINT "WardrobeItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outfit" ADD CONSTRAINT "Outfit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_wardrobeItemId_fkey" FOREIGN KEY ("wardrobeItemId") REFERENCES "WardrobeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedLook" ADD CONSTRAINT "SavedLook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedLook" ADD CONSTRAINT "SavedLook_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_savedLookId_fkey" FOREIGN KEY ("savedLookId") REFERENCES "SavedLook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_wardrobeItemId_fkey" FOREIGN KEY ("wardrobeItemId") REFERENCES "WardrobeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendItem" ADD CONSTRAINT "TrendItem_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE CASCADE ON UPDATE CASCADE;
