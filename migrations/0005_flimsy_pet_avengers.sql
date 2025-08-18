CREATE TABLE "plan_items" (
	"id" varchar PRIMARY KEY NOT NULL,
	"plan_id" varchar NOT NULL,
	"name" text NOT NULL,
	"quantity" numeric(8, 2) NOT NULL,
	"unit" text NOT NULL,
	"rate" numeric(10, 2) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"planned_date" date,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_template" boolean DEFAULT false,
	"template_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plan_items" ADD CONSTRAINT "plan_items_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;