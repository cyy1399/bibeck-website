import { boolean, index, jsonb, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const rebateActivationCases = pgTable("rebate_activation_cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseNumber: text("case_number").notNull().unique(),
  exchange: text("exchange").notNull().default("bybit"),
  displayName: text("display_name").notNull(),
  uid: text("uid").notNull(),
  normalizedUid: text("normalized_uid").notNull(),
  contactEmail: text("contact_email").notNull(),
  normalizedEmail: text("normalized_email").notNull(),
  status: text("status").notNull().default("PENDING"),
  rebateRate: numeric("rebate_rate", { precision: 5, scale: 2, mode: "number" }).notNull().default(20),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  completedBy: text("completed_by"),
  completionConfirmed: boolean("completion_confirmed").notNull().default(false),
  emailReceiptSentAt: timestamp("email_receipt_sent_at", { withTimezone: true }),
  completionEmailSentAt: timestamp("completion_email_sent_at", { withTimezone: true }),
  notificationStatus: text("notification_status").notNull().default("PENDING"),
  notificationError: text("notification_error"),
  publicMessage: text("public_message"),
  adminNote: text("admin_note"),
  consentVersion: text("consent_version").notNull(),
  consentedAt: timestamp("consented_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  source: text("source").notNull().default("website"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
}, (table) => [
  uniqueIndex("rebate_activation_uid_unique").on(table.exchange, table.normalizedUid),
  index("rebate_activation_status_created_idx").on(table.status, table.createdAt),
  index("rebate_activation_email_idx").on(table.normalizedEmail),
]);

export const rebateCaseEvents = pgTable("rebate_case_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id").notNull().references(() => rebateActivationCases.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  actorEmail: text("actor_email").notNull(),
  publicMessage: text("public_message"),
  internalMessage: text("internal_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("rebate_case_events_case_created_idx").on(table.caseId, table.createdAt)]);

// Existing, separate higher-rate application workflow. It is not linked to standard activation.
export const highVolumePreReviewCases = pgTable("high_volume_pre_review_cases", {
  id: uuid("id").defaultRandom().primaryKey(), caseNumber: text("case_number").notNull().unique(), exchange: text("exchange").notNull(), displayName: text("display_name").notNull(), contactEmail: text("contact_email").notNull(), currentUid: text("current_uid"), status: text("status").notNull().default("SUBMITTED"), approvedRate: numeric("approved_rate", { precision: 5, scale: 2, mode: "number" }), applicationData: jsonb("application_data").notNull(), notificationError: text("notification_error"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RebateActivationCase = typeof rebateActivationCases.$inferSelect;
export type RebateCaseEvent = typeof rebateCaseEvents.$inferSelect;
