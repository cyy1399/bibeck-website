ALTER TABLE "rebate_activation_cases" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "rebate_activation_cases" ALTER COLUMN "status" TYPE text USING (
  CASE "status"::text
    WHEN 'SUBMITTED' THEN 'PENDING'
    WHEN 'UID_PENDING' THEN 'PENDING'
    WHEN 'PENDING_MANUAL_SETUP' THEN 'PENDING'
    WHEN 'NOT_ATTRIBUTED' THEN 'NOT_FOUND'
    ELSE "status"::text
  END
);
ALTER TABLE "rebate_activation_cases" ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "rebate_case_events" ALTER COLUMN "previous_status" TYPE text USING (
  CASE "previous_status"::text
    WHEN 'SUBMITTED' THEN 'PENDING'
    WHEN 'UID_PENDING' THEN 'PENDING'
    WHEN 'PENDING_MANUAL_SETUP' THEN 'PENDING'
    WHEN 'NOT_ATTRIBUTED' THEN 'NOT_FOUND'
    ELSE "previous_status"::text
  END
);
ALTER TABLE "rebate_case_events" ALTER COLUMN "new_status" TYPE text USING (
  CASE "new_status"::text
    WHEN 'SUBMITTED' THEN 'PENDING'
    WHEN 'UID_PENDING' THEN 'PENDING'
    WHEN 'PENDING_MANUAL_SETUP' THEN 'PENDING'
    WHEN 'NOT_ATTRIBUTED' THEN 'NOT_FOUND'
    ELSE "new_status"::text
  END
);

ALTER TABLE "rebate_activation_cases" ADD COLUMN "rebate_rate" numeric(5,2) DEFAULT 20 NOT NULL;
ALTER TABLE "rebate_activation_cases" ADD COLUMN "completed_by" text;
ALTER TABLE "rebate_activation_cases" ADD COLUMN "completion_confirmed" boolean DEFAULT false NOT NULL;
ALTER TABLE "rebate_activation_cases" ADD COLUMN "email_receipt_sent_at" timestamp with time zone;
ALTER TABLE "rebate_activation_cases" ADD COLUMN "completion_email_sent_at" timestamp with time zone;
ALTER TABLE "rebate_activation_cases" ADD COLUMN "notification_status" text DEFAULT 'PENDING' NOT NULL;

UPDATE "rebate_activation_cases"
SET "rebate_rate" = 20,
    "completion_confirmed" = CASE WHEN "status" = 'COMPLETED' THEN "external_setup_confirmed" ELSE false END,
    "notification_status" = CASE WHEN "notification_error" IS NULL THEN 'SENT' ELSE 'FAILED' END;

DROP INDEX IF EXISTS "rebate_activation_active_uid_unique";
CREATE UNIQUE INDEX "rebate_activation_uid_unique" ON "rebate_activation_cases" USING btree ("exchange", "normalized_uid");
DROP INDEX IF EXISTS "rebate_activation_pre_review_idx";

ALTER TABLE "rebate_activation_cases" DROP COLUMN "registration_date";
ALTER TABLE "rebate_activation_cases" DROP COLUMN "account_scenario";
ALTER TABLE "rebate_activation_cases" DROP COLUMN "kyc_status";
ALTER TABLE "rebate_activation_cases" DROP COLUMN "messaging_contact";
ALTER TABLE "rebate_activation_cases" DROP COLUMN "pre_review_case_number";
ALTER TABLE "rebate_activation_cases" DROP COLUMN "user_note";
ALTER TABLE "rebate_activation_cases" DROP COLUMN "default_rate";
ALTER TABLE "rebate_activation_cases" DROP COLUMN "approved_rate";
ALTER TABLE "rebate_activation_cases" DROP COLUMN "effective_at";
ALTER TABLE "rebate_activation_cases" DROP COLUMN "external_setup_confirmed";
ALTER TABLE "rebate_activation_cases" DROP COLUMN "tracking_token_hash";

DROP TYPE IF EXISTS "rebate_case_status";

ALTER TABLE "rebate_activation_cases" ADD CONSTRAINT "rebate_activation_status_check"
  CHECK ("status" IN ('PENDING', 'NEEDS_INFORMATION', 'NOT_FOUND', 'COMPLETED', 'CANCELLED'));
ALTER TABLE "rebate_activation_cases" ADD CONSTRAINT "rebate_activation_rate_check"
  CHECK ("rebate_rate" = 20);
