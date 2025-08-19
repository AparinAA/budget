-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "rolloverEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rolloverTargetId" TEXT;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_rolloverTargetId_fkey" FOREIGN KEY ("rolloverTargetId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
