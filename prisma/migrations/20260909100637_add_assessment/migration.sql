-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('MCQ_SINGLE', 'MULTI_SELECT');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('DRAFT', 'LIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "AuthoredBy" AS ENUM ('HUMAN', 'PIPELINE');

-- CreateEnum
CREATE TYPE "AssessmentScope" AS ENUM ('LESSON', 'EXAM');

-- CreateEnum
CREATE TYPE "AttemptState" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "stemAr" TEXT NOT NULL,
    "stemEn" TEXT NOT NULL,
    "bloom" "Bloom" NOT NULL,
    "isScenario" BOOLEAN NOT NULL DEFAULT false,
    "formative" BOOLEAN NOT NULL DEFAULT false,
    "rationaleAr" TEXT NOT NULL,
    "rationaleEn" TEXT NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'DRAFT',
    "authoredBy" "AuthoredBy" NOT NULL DEFAULT 'HUMAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemOption" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "textAr" TEXT NOT NULL,
    "textEn" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "feedbackAr" TEXT NOT NULL,
    "feedbackEn" TEXT NOT NULL,

    CONSTRAINT "ItemOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "scope" "AssessmentScope" NOT NULL,
    "scopeId" TEXT,
    "itemCount" INTEGER NOT NULL,
    "timeLimitSec" INTEGER,
    "passPct" INTEGER NOT NULL DEFAULT 70,
    "assemblyJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "itemIdsJson" JSONB NOT NULL,
    "seed" TEXT NOT NULL,
    "scorePct" INTEGER,
    "passed" BOOLEAN,
    "attemptNo" INTEGER NOT NULL DEFAULT 1,
    "state" "AttemptState" NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "responseJson" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalScorePct" INTEGER NOT NULL,
    "objectivesMet" TEXT[],
    "payloadHash" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Item_courseId_objectiveId_status_idx" ON "Item"("courseId", "objectiveId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ItemOption_itemId_order_key" ON "ItemOption"("itemId", "order");

-- CreateIndex
CREATE INDEX "Assessment_courseId_scope_idx" ON "Assessment"("courseId", "scope");

-- CreateIndex
CREATE INDEX "Attempt_userId_assessmentId_idx" ON "Attempt"("userId", "assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptAnswer_attemptId_itemId_key" ON "AttemptAnswer"("attemptId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_serial_key" ON "Certificate"("serial");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- AddForeignKey
ALTER TABLE "ItemOption" ADD CONSTRAINT "ItemOption_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
