-- AlterTable
ALTER TABLE "User" ADD COLUMN "businessApprovalStatus" TEXT NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Business" RENAME COLUMN "name" TO "businessName";
ALTER TABLE "Business" RENAME COLUMN "tin" TO "businessTin";
ALTER TABLE "Business" RENAME COLUMN "type" TO "businessType";
ALTER TABLE "Business" RENAME COLUMN "address" TO "businessAddress";
ALTER TABLE "Business" RENAME COLUMN "contact" TO "businessContact";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN "ownerName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Business" ADD COLUMN "ownerTin" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Business" ADD COLUMN "businessEmail" TEXT;
ALTER TABLE "Business" ADD COLUMN "businessRegNum" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Business_businessTin_key" ON "Business"("businessTin");
CREATE UNIQUE INDEX "Business_ownerTin_key" ON "Business"("ownerTin");
