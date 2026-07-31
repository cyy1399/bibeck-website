import { sql } from "drizzle-orm";
import { boolean, index, jsonb, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const rebateCaseStatus = pgEnum("rebate_case_status", ["SUBMITTED", "UID_PENDING", "PENDING_MANUAL_SETUP", "NEEDS_INFORMATION", "NOT_ATTRIBUTED", "COMPLETED", "CANCELLED"]);

export const rebateActivationCases = pgTable("rebate_activation_cases", {
  id: uuid("id").defaultRandom().primaryKey(), caseNumber: text("case_number").notNull().unique(), exchange: text("exchange").notNull(), uid: text("uid").notNull(), normalizedUid: text("normalized_uid").notNull(),
  displayName: text("display_name").notNull(), contactEmail: text("contact_email").notNull(), normalizedEmail: text("normalized_email").notNull(), registrationDate: timestamp("registration_date", { withTimezone: true }).notNull(),
  accountScenario: text("account_scenario").notNull(), kycStatus: text("kyc_status").notNull(), messagingContact: text("messaging_contact"), preReviewCaseNumber: text("pre_review_case_number"), userNote: text("user_note"),
  status: rebateCaseStatus("status").notNull().default("SUBMITTED"), defaultRate: numeric("default_rate", { precision: 5, scale: 2, mode: "number" }).notNull().default(20), approvedRate: numeric("approved_rate", { precision: 5, scale: 2, mode: "number" }),
  effectiveAt: timestamp("effective_at", { withTimezone: true }), externalSetupConfirmed: boolean("external_setup_confirmed").notNull().default(false), adminNote: text("admin_note"), publicMessage: text("public_message"),
  trackingTokenHash: text("tracking_token_hash").notNull().unique(), consentVersion: text("consent_version").notNull(), consentedAt: timestamp("consented_at", { withTimezone: true }).notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(), completedAt: timestamp("completed_at", { withTimezone: true }), notificationError: text("notification_error"),
  source: text("source").notNull().default("website"), utmSource: text("utm_source"), utmMedium: text("utm_medium"), utmCampaign: text("utm_campaign"),
}, (table) => [
  uniqueIndex("rebate_activation_active_uid_unique").on(table.exchange, table.normalizedUid).where(sql`${table.status} not in ('NOT_ATTRIBUTED', 'CANCELLED')`),
  index("rebate_activation_status_created_idx").on(table.status, table.createdAt), index("rebate_activation_email_idx").on(table.normalizedEmail), index("rebate_activation_pre_review_idx").on(table.preReviewCaseNumber),
]);

export const rebateCaseEvents = pgTable("rebate_case_events", {
  id: uuid("id").defaultRandom().primaryKey(), caseId: uuid("case_id").notNull().references(() => rebateActivationCases.id, { onDelete: "cascade" }), eventType: text("event_type").notNull(), previousStatus: rebateCaseStatus("previous_status"), newStatus: rebateCaseStatus("new_status"), actorEmail: text("actor_email").notNull(), publicMessage: text("public_message"), internalMessage: text("internal_message"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("rebate_case_events_case_created_idx").on(table.caseId, table.createdAt)]);

export const highVolumePreReviewCases = pgTable("high_volume_pre_review_cases", {
  id: uuid("id").defaultRandom().primaryKey(), caseNumber: text("case_number").notNull().unique(), exchange: text("exchange").notNull(), displayName: text("display_name").notNull(), contactEmail: text("contact_email").notNull(), currentUid: text("current_uid"), status: text("status").notNull().default("SUBMITTED"), approvedRate: numeric("approved_rate", { precision: 5, scale: 2, mode: "number" }), applicationData: jsonb("application_data").notNull(), notificationError: text("notification_error"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RebateActivationCase = typeof rebateActivationCases.$inferSelect;
export type RebateCaseEvent = typeof rebateCaseEvents.$inferSelect;
