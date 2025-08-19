-- CreateTable
CREATE TABLE "MonthlyBudgetStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalIncome" INTEGER NOT NULL,
    "totalExpenses" INTEGER NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'RUB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyBudgetStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyBudgetStats_userId_month_year_key" ON "MonthlyBudgetStats"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "MonthlyBudgetStats" ADD CONSTRAINT "MonthlyBudgetStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
