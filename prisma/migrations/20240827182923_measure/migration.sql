/*
  Warnings:

  - A unique constraint covering the columns `[measure_datetime]` on the table `readings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "readings_measure_datetime_key" ON "readings"("measure_datetime");
