-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "public" BOOLEAN NOT NULL,
    "role" TEXT NOT NULL
);
INSERT INTO "new_Group" ("avatar", "id", "name", "public", "role") SELECT "avatar", "id", "name", "public", "role" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
