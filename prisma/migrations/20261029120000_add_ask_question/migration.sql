-- CreateEnum
CREATE TYPE "AskOutcome" AS ENUM ('ANSWERED', 'NOT_COVERED', 'FAILED');

-- CreateTable
CREATE TABLE "AskQuestion" (
    "id" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "question" TEXT NOT NULL,
    "outcome" "AskOutcome" NOT NULL,
    "cites" TEXT[],
    "ms" INTEGER NOT NULL DEFAULT 0,
    "visitor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AskQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AskQuestion_createdAt_idx" ON "AskQuestion"("createdAt");

-- CreateIndex
CREATE INDEX "AskQuestion_visitor_createdAt_idx" ON "AskQuestion"("visitor", "createdAt");
