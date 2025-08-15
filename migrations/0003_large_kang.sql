ALTER TABLE "expenses" ADD COLUMN "invoice_number" text;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "invoice_date" date;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "invoice_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "income" ADD COLUMN "invoice_number" text;--> statement-breakpoint
ALTER TABLE "income" ADD COLUMN "invoice_date" date;--> statement-breakpoint
ALTER TABLE "income" ADD COLUMN "invoice_amount" numeric(10, 2);