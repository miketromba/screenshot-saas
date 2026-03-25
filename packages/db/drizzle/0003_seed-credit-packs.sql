INSERT INTO credit_packs (name, credits, price_cents, is_popular, is_active, sort_order)
VALUES
  ('Starter', 100, 500, false, true, 0),
  ('Growth', 500, 2000, true, true, 1),
  ('Pro', 2000, 6000, false, true, 2),
  ('Scale', 10000, 20000, false, true, 3)
ON CONFLICT DO NOTHING;
