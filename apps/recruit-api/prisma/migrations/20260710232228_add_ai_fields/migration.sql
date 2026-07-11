-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "fit_explanation" TEXT,
ADD COLUMN     "match_score" INTEGER,
ADD COLUMN     "suggested_questions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "summary" TEXT;
