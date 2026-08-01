CREATE TYPE "public"."rebate_case_status" AS ENUM('SUBMITTED', 'UID_PENDING', 'PENDING_MANUAL_SETUP', 'NEEDS_INFORMATION', 'NOT_ATTRIBUTED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "high_volume_pre_review_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_number" text NOT NULL,
	"exchange" text NOT NULL,
	"display_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"current_uid" text,
	"status" text DEFAULT 'SUBMITTED' NOT NULL,
	"approved_rate" numeric(5, 2),
	"application_data" jsonb NOT NULL,
	"notification_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "high_volume_pre_review_cases_case_number_unique" UNIQUE("case_number")
);
--> statement-breakpoint
CREATE TABLE "rebate_activation_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_number" text NOT NULL,
	"exchange" text NOT NULL,
	"uid" text NOT NULL,
	"normalized_uid" text NOT NULL,
	"display_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"normalized_email" text NOT NULL,
	"registration_date" timestamp with time zone NOT NULL,
	"account_scenario" text NOT NULL,
	"kyc_status" text NOT NULL,
	"messaging_contact" text,
	"pre_review_case_number" text,
	"user_note" text,
	"status" "rebate_case_status" DEFAULT 'SUBMITTED' NOT NULL,
	"default_rate" numeric(5, 2) DEFAULT 20 NOT NULL,
	"approved_rate" numeric(5, 2),
	"effective_at" timestamp with time zone,
	"external_setup_confirmed" boolean DEFAULT false NOT NULL,
	"admin_note" text,
	"public_message" text,
	"tracking_token_hash" text NOT NULL,
	"consent_version" text NOT NULL,
	"consented_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"notification_error" text,
	"source" text DEFAULT 'website' NOT NULL,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	CONSTRAINT "rebate_activation_cases_case_number_unique" UNIQUE("case_number"),
	CONSTRAINT "rebate_activation_cases_tracking_token_hash_unique" UNIQUE("tracking_token_hash")
);
--> statement-breakpoint
CREATE TABLE "rebate_case_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"previous_status" "rebate_case_status",
	"new_status" "rebate_case_status",
	"actor_email" text NOT NULL,
	"public_message" text,
	"internal_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rebate_case_events" ADD CONSTRAINT "rebate_case_events_case_id_rebate_activation_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."rebate_activation_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "rebate_activation_active_uid_unique" ON "rebate_activation_cases" USING btree ("exchange","normalized_uid") WHERE "rebate_activation_cases"."status" not in ('NOT_ATTRIBUTED', 'CANCELLED');--> statement-breakpoint
CREATE INDEX "rebate_activation_status_created_idx" ON "rebate_activation_cases" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "rebate_activation_email_idx" ON "rebate_activation_cases" USING btree ("normalized_email");--> statement-breakpoint
CREATE INDEX "rebate_activation_pre_review_idx" ON "rebate_activation_cases" USING btree ("pre_review_case_number");--> statement-breakpoint
CREATE INDEX "rebate_case_events_case_created_idx" ON "rebate_case_events" USING btree ("case_id","created_at");