-- AlterUserTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- Add phone column (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM "information_schema"."columns"
        WHERE "table_schema" = 'public'
        AND "table_name" = 'User'
        AND "column_name" = 'phone_unique'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "phone_unique" TEXT;
    END IF;
END $$;

-- Create unique index on phone (only non-null values)
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone_unique") WHERE "phone_unique" IS NOT NULL;

-- Add OTP fields to User
ALTER TABLE "User" ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "otpCode" TEXT;
ALTER TABLE "User" ADD COLUMN "otpExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "otpAttempts" INTEGER NOT NULL DEFAULT 0;

-- Create DealerApplication table
CREATE TABLE "DealerApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "companyName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "documents" TEXT[] NOT NULL DEFAULT '{}',
    "otpCode" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '1 hour',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    CONSTRAINT "DealerApplication_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "DealerApplication_phone_idx" ON "DealerApplication"("phone");
CREATE INDEX "DealerApplication_verified_idx" ON "DealerApplication"("verified");

-- Add comment for DealerApplication table
COMMENT ON COLUMN "DealerApplication"."expiresAt" IS 'Auto-expiry after 1 hour';
