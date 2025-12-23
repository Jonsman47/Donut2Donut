-- Add missing optional profile fields
ALTER TABLE "User" ADD COLUMN "mcUsername" TEXT;
ALTER TABLE "User" ADD COLUMN "realName" TEXT;
ALTER TABLE "User" ADD COLUMN "setupCompletedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "tosAcceptedAt" DATETIME;

-- Create follow relationship table
CREATE TABLE IF NOT EXISTS "Follow" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("followerId", "followingId"),
    CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
