/*
  Warnings:

  - Added the required column `measure_value` to the `readings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "readings" ADD COLUMN     "measure_value" INTEGER NOT NULL;
