CREATE TABLE "savings_accounts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"scheme_type" text NOT NULL,
	"account_number" text,
	"institution" text,
	"interest_rate" numeric(5, 2) NOT NULL,
	"maturity_date" date,
	"maturity_amount" numeric(12, 2),
	"current_balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"target_amount" numeric(12, 2),
	"min_contribution" numeric(10, 2),
	"max_contribution" numeric(10, 2),
	"contribution_frequency" text DEFAULT 'monthly',
	"lock_in_period" integer,
	"tax_benefit" boolean DEFAULT false,
	"status" text DEFAULT 'active' NOT NULL,
	"opening_date" date NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "savings_transactions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"savings_account_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"transaction_date" date NOT NULL,
	"balance_after" numeric(12, 2) NOT NULL,
	"interest_earned" numeric(10, 2),
	"reference_number" text,
	"invoice_file_name" text,
	"invoice_file_path" text,
	"invoice_file_type" text,
	"invoice_file_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "savings_accounts" ADD CONSTRAINT "savings_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savings_transactions" ADD CONSTRAINT "savings_transactions_savings_account_id_savings_accounts_id_fk" FOREIGN KEY ("savings_account_id") REFERENCES "public"."savings_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savings_transactions" ADD CONSTRAINT "savings_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;