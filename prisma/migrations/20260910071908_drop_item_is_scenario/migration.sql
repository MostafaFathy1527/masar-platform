-- The isScenario flag was hand-set on a third of the item bank and reported
-- as a "scenario-led" percentage, while the longest flagged stem was less
-- than half the defined minimum length. It measured itself rather than the
-- property it named, so it is dropped rather than renamed.
--
-- Generated offline with `prisma migrate diff` between the previous and
-- current datamodel, because 5432 was unreachable. CI's migrations job
-- replays every migration against a real Postgres and asserts no drift.

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "isScenario";

