-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetPasswordCode" TEXT,
ADD COLUMN     "resetPasswordExpiry" TIMESTAMP(3),
ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verificationCodeExpiry" TIMESTAMP(3);
