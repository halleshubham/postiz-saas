/*
  Warnings:

  - You are about to drop the column `postizApiTokenEncrypted` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the `PostizIntegration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostizScheduledPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostizIntegration" DROP CONSTRAINT "PostizIntegration_companyId_fkey";

-- DropForeignKey
ALTER TABLE "PostizScheduledPost" DROP CONSTRAINT "PostizScheduledPost_companyId_fkey";

-- DropForeignKey
ALTER TABLE "PostizScheduledPost" DROP CONSTRAINT "PostizScheduledPost_createdById_fkey";

-- DropForeignKey
ALTER TABLE "PostizScheduledPost" DROP CONSTRAINT "PostizScheduledPost_integrationId_fkey";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "postizApiTokenEncrypted";

-- DropTable
DROP TABLE "PostizIntegration";

-- DropTable
DROP TABLE "PostizScheduledPost";
