ALTER TABLE "rebate_activation_cases" ADD COLUMN IF NOT EXISTS "application_type" text DEFAULT 'standard' NOT NULL;
ALTER TABLE "rebate_activation_cases" ADD COLUMN IF NOT EXISTS "volume_range" text DEFAULT 'uncertain' NOT NULL;
ALTER TABLE "rebate_activation_cases" ADD COLUMN IF NOT EXISTS "applicant_message" text;
ALTER TABLE "rebate_activation_cases" ALTER COLUMN "rebate_rate" SET DEFAULT 35;
