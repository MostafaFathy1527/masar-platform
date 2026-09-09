-- CreateEnum
CREATE TYPE "SimulationKind" AS ENUM ('CLAIM_REVIEW');

-- CreateEnum
CREATE TYPE "ScoringMode" AS ENUM ('PRECISION_RECALL');

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "SimulationKind" NOT NULL,
    "objectiveIds" TEXT[],
    "datasetJson" JSONB NOT NULL,
    "seededErrorsJson" JSONB NOT NULL,
    "rubricJson" JSONB,
    "scoringMode" "ScoringMode" NOT NULL DEFAULT 'PRECISION_RECALL',
    "passPct" INTEGER NOT NULL DEFAULT 70,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimSubmission" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "responseJson" JSONB NOT NULL,
    "scoreJson" JSONB NOT NULL,
    "scorePct" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Simulation_slug_key" ON "Simulation"("slug");

-- CreateIndex
CREATE INDEX "Simulation_courseId_idx" ON "Simulation"("courseId");

-- CreateIndex
CREATE INDEX "SimSubmission_userId_simulationId_idx" ON "SimSubmission"("userId", "simulationId");

-- AddForeignKey
ALTER TABLE "SimSubmission" ADD CONSTRAINT "SimSubmission_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimSubmission" ADD CONSTRAINT "SimSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
