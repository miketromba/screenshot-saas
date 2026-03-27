-- Deactivate old credit packs
UPDATE credit_packs SET is_active = false;

-- Insert new credit packs with Polar product IDs
INSERT INTO credit_packs (name, credits, price_cents, stripe_price_id, is_popular, is_active, sort_order)
VALUES
  ('Starter', 1000, 900, '9e7e5e87-d801-4131-8d50-42d40e98956b', false, true, 0),
  ('Growth', 5000, 2900, '6e7aac48-228a-45ed-8e8e-241aa04ef5b2', true, true, 1),
  ('Pro', 25000, 9900, '46ca1db9-2c05-4eea-a93b-c5891132357d', false, true, 2),
  ('Scale', 100000, 29900, 'a4eedd18-0119-43f1-a256-45cc99279220', false, true, 3);
