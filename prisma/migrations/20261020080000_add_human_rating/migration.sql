-- CreateTable
CREATE TABLE "HumanRating" (
    "id" TEXT NOT NULL,
    "rater" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "lang" "Locale" NOT NULL,
    "scores" JSONB NOT NULL,
    "notes" JSONB NOT NULL,
    "overall" TEXT NOT NULL DEFAULT '',
    "seconds" INTEGER NOT NULL DEFAULT 0,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HumanRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HumanRating_rater_sampleId_lang_key" ON "HumanRating"("rater", "sampleId", "lang");
