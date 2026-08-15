-- AlterTable
ALTER TABLE "Outfit" ADD COLUMN     "aiTryOnStatus" TEXT NOT NULL DEFAULT 'idle',
ADD COLUMN     "aiTryOnUrl" TEXT;
