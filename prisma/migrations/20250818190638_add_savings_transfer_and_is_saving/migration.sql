-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isSaving" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SavingsTransfer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'RUB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavingsTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavingsTransfer_userId_year_month_categoryId_key" ON "SavingsTransfer"("userId", "year", "month", "categoryId");

-- AddForeignKey
ALTER TABLE "SavingsTransfer" ADD CONSTRAINT "SavingsTransfer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsTransfer" ADD CONSTRAINT "SavingsTransfer_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
