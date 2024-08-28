/*
  Warnings:

  - Added the required column `measure_uuid` to the `readings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "readings" ADD COLUMN     "measure_uuid" INTEGER NOT NULL;
