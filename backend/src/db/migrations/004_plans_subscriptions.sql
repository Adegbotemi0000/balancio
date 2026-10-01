-- Billing skeleton only (see docs/06-pricing-plans.md -- nothing about
-- pricing is confirmed yet). A "plans" table exists so signup has something
-- real to select from, and "tenant_subscriptions" tracks status without
-- actually integrating a payment processor yet (docs/10-open-questions.md).
-- A subscription starts 'trialing' at signup; nothing here charges a card.
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  code VARCHAR(40) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  seat_count INTEGER NOT NULL,
  monthly_price_usd NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL UNIQUE REFERENCES tenants(id),
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'trialing'
    CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
  trial_ends_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  payment_processor_customer_id VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed a single placeholder plan so signup has something to attach a new
-- tenant to before real pricing is decided -- rename/replace once
-- docs/06-pricing-plans.md's open questions are answered.
INSERT INTO plans (code, name, seat_count, monthly_price_usd, sort_order)
VALUES ('starter', 'Starter (placeholder)', 3, NULL, 1)
ON CONFLICT (code) DO NOTHING;
