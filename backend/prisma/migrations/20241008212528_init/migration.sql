/*
  Warnings:

  - You are about to drop the `Answer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `quizId` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Score` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Quiz_apiId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Answer";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Question";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Quiz";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Score" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "score" INTEGER NOT NULL,
    "time" REAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Score" ("id", "userId") SELECT "id", "userId" FROM "Score";
DROP TABLE "Score";
ALTER TABLE "new_Score" RENAME TO "Score";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
