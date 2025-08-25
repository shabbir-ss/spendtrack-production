CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"vendor" text,
	"amount" numeric(10, 2),
	"invoice_date" date,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;