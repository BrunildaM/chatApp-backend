-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL,
    "role" TEXT NOT NULL
);
INSERT INTO "new_Group" ("avatar", "id", "name", "public", "role") SELECT "avatar", "id", "name", "public", "role" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "public" BOOLEAN NOT NULL
);
INSERT INTO "new_User" ("avatar", "createdAt", "email", "fullname", "id", "password", "public") SELECT "avatar", "createdAt", "email", "fullname", "id", "password", "public" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
