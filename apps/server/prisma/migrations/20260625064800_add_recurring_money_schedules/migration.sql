-- CreateEnum
CREATE TYPE "ScheduleFrequency" AS ENUM ('ONCE', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'CUSTOM');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "customDates" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
ADD COLUMN     "frequency" "ScheduleFrequency" NOT NULL DEFAULT 'ONCE';

-- AlterTable
ALTER TABLE "IncomeSource" ADD COLUMN     "customDates" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
ADD COLUMN     "frequency" "ScheduleFrequency" NOT NULL DEFAULT 'ONCE';
