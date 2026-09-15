DROP INDEX IF EXISTS "rebate_activation_uid_unique";

ALTER TABLE "rebate_activation_cases" DROP CONSTRAINT IF EXISTS "rebate_activation_rate_check";
UPDATE "rebate_activation_cases" SET "rebate_rate" = 35;
ALTER TABLE "rebate_activation_cases" ADD CONSTRAINT "rebate_activation_rate_check" CHECK ("rebate_rate" = 35);

ALTER TABLE "rebate_activation_cases" DROP CONSTRAINT IF EXISTS "rebate_activation_status_check";
ALTER TABLE "rebate_activation_cases" ALTER COLUMN "status" DROP DEFAULT;
UPDATE "rebate_activation_cases" SET "status" = CASE "status"
  WHEN 'PENDING' THEN 'SUBMITTED'
  WHEN 'NEEDS_INFORMATION' THEN 'REVIEWING'
  WHEN 'NOT_FOUND' THEN 'REJECTED'
  WHEN 'COMPLETED' THEN 'ACTIVATED'
  WHEN 'CANCELLED' THEN 'REJECTED'
  ELSE "status"
END;
ALTER TABLE "rebate_activation_cases" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
ALTER TABLE "rebate_activation_cases" ADD CONSTRAINT "rebate_activation_status_check"
  CHECK ("status" IN ('SUBMITTED', 'REVIEWING', 'APPROVED', 'ACTIVATED', 'REJECTED'));

ALTER TABLE "rebate_activation_cases" ADD COLUMN "review_note" text;
ALTER TABLE "rebate_activation_cases" ADD COLUMN "reviewed_at" timestamp with time zone;
ALTER TABLE "rebate_activation_cases" ADD COLUMN "email_sent_at" timestamp with time zone;
ALTER TABLE "rebate_activation_cases" ADD COLUMN "privacy_version" text;
UPDATE "rebate_activation_cases" SET "privacy_version" = '2026-09-16' WHERE "privacy_version" IS NULL;
ALTER TABLE "rebate_activation_cases" ALTER COLUMN "privacy_version" SET NOT NULL;

CREATE INDEX "rebate_activation_uid_idx" ON "rebate_activation_cases" USING btree ("exchange", "normalized_uid");
CREATE INDEX "rebate_activation_duplicate_window_idx" ON "rebate_activation_cases" USING btree ("normalized_uid", "normalized_email", "created_at");
