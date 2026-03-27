CREATE TABLE "screenshot_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cache_key" text NOT NULL,
	"image_data" text NOT NULL,
	"content_type" text NOT NULL,
	"url" text NOT NULL,
	"options_hash" text NOT NULL,
	"ttl_seconds" integer DEFAULT 86400 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" text NOT NULL,
	"status" text NOT NULL,
	"billing_cycle" text NOT NULL,
	"screenshots_per_month" integer NOT NULL,
	"screenshots_used_this_month" integer DEFAULT 0 NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"polar_subscription_id" text,
	"polar_customer_id" text,
	"overage_rate_cents" integer,
	"overage_screenshots" integer DEFAULT 0 NOT NULL,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"endpoint_id" uuid NOT NULL,
	"event" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status_code" integer,
	"response" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_endpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"url" text NOT NULL,
	"secret" text NOT NULL,
	"events" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credit_balances" ALTER COLUMN "balance" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "screenshots" ADD COLUMN "cached_response" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpoint_id_webhook_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."webhook_endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "screenshot_cache_key_idx" ON "screenshot_cache" USING btree ("cache_key");--> statement-breakpoint
CREATE INDEX "screenshot_cache_expires_idx" ON "screenshot_cache" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscriptions_polar_sub_id_idx" ON "subscriptions" USING btree ("polar_subscription_id");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_endpoint_id_idx" ON "webhook_deliveries" USING btree ("endpoint_id");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_created_at_idx" ON "webhook_deliveries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "webhook_endpoints_user_id_idx" ON "webhook_endpoints" USING btree ("user_id");