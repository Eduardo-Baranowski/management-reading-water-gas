/*
  Warnings:

  - You are about to drop the column `confirmed` on the `readings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "readings" DROP COLUMN "confirmed",
ADD COLUMN     "(has_confirmed)" BOOLEAN NOT NULL DEFAULT false;
