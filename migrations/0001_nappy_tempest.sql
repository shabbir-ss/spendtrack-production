CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"mobile" text NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"sms_notifications" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "bills" ADD COLUMN "user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "income" ADD COLUMN "user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;