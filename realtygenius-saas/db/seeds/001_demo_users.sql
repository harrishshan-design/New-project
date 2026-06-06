INSERT INTO users (name, email, phone, password_hash, role, agency_name, ren_id, status)
VALUES
  ('Aina Rahman', 'buyer@realtygenius.my', '+60123330001', '$2a$12$ic/9UIdycoldCU/WzzeQs.WGDqg5Zoa6165gWJa0uToduVXjHkzDK', 'buyer', NULL, NULL, 'active'),
  ('Daniel Tan', 'agent@realtygenius.my', '+60123330002', '$2a$12$8x8buMEESibCss0t0R2Ri.QP2cvJ6tXcFGvSg/FWDEBuwkIl6jL0G', 'agent', 'RealtyGenius Elite Realty', 'REN12345', 'active'),
  ('Gatekeeper Admin', 'admin@realtygenius.my', '+60123330003', '$2a$12$RcyQj/gU36AlMCD0pAizLeDyK8XoBpDIm0p/FpfY/E7SR9wzSNR5q', 'admin', NULL, NULL, 'active')
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    agency_name = EXCLUDED.agency_name,
    ren_id = EXCLUDED.ren_id,
    status = 'active';

INSERT INTO agent_marketplace_profiles (agent_id, elite_verified_at, manually_seeded, response_sla_minutes, marketplace_status)
SELECT id, NOW(), TRUE, 5, 'elite_verified'
FROM users
WHERE email = 'agent@realtygenius.my'
ON CONFLICT (agent_id) DO UPDATE
SET elite_verified_at = COALESCE(agent_marketplace_profiles.elite_verified_at, NOW()),
    manually_seeded = TRUE,
    response_sla_minutes = 5,
    marketplace_status = 'elite_verified';

INSERT INTO properties (
  agent_id, title, address, area, property_type, asking_price, bedrooms, bathrooms,
  built_up_sqft, maintenance_fee, developer, image_url, verification_source,
  confidence_score, last_verified_at
)
SELECT
  id,
  'Bangsar South Residence',
  'Bangsar South, Kuala Lumpur',
  'Bangsar',
  'Condo',
  1200000,
  3,
  2,
  1033,
  0.38,
  'UOA Group',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
  'agent',
  88,
  NOW()
FROM users
WHERE email = 'agent@realtygenius.my'
  AND NOT EXISTS (
    SELECT 1 FROM properties WHERE title = 'Bangsar South Residence'
  );

INSERT INTO property_transactions (property_id, transacted_price, transacted_at, unit_size_sqft, source)
SELECT p.id, txn.price, txn.date::date, txn.sqft, 'seed'
FROM properties p
CROSS JOIN (
  VALUES
    (1160000, '2026-01-12', 1033),
    (1190000, '2025-11-18', 1033),
    (1125000, '2025-09-08', 1012)
) AS txn(price, date, sqft)
WHERE p.title = 'Bangsar South Residence'
  AND NOT EXISTS (
    SELECT 1 FROM property_transactions existing
    WHERE existing.property_id = p.id AND existing.source = 'seed'
  );
