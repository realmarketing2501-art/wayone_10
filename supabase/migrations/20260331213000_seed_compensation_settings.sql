INSERT INTO public.admin_settings (key, value, description)
VALUES
  (
    'level_config',
    '[{"name":"BRONZ","label":"Bronz","rate":1,"order":1,"active":true},{"name":"SILVER","label":"Silver","rate":2,"order":2,"active":true},{"name":"SILVER_ELITE","label":"Silver Elite","rate":3,"order":3,"active":true},{"name":"GOLD","label":"Gold","rate":4,"order":4,"active":true},{"name":"DIAMANTE","label":"Diamante","rate":5,"order":5,"active":true}]',
    'Default compensation levels for WAY ONE'
  ),
  (
    'withdrawal_config',
    '[{"key":"fast","label":"Veloce","hours":24,"fee_pct":20,"active":true},{"key":"medium","label":"Medio","hours":48,"fee_pct":10,"active":true},{"key":"slow","label":"Lento","hours":72,"fee_pct":5,"active":true}]',
    'Default withdrawal rules for WAY ONE'
  )
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = now();
