-- Settings Seed Data
-- Run this SQL script to populate default settings

-- General Category
INSERT INTO settings (key, value, name, description, category, created_at, updated_at)
VALUES
  ('COMPANY_NAME', 'POS Delmar', 'Nombre de la Empresa', 'Nombre de la empresa que aparece en los recibos y documentos', 'General', NOW(), NOW()),
  ('COMPANY_RUT', '12.345.678-9', 'RUT de la Empresa', 'RUT o identificación fiscal de la empresa', 'General', NOW(), NOW()),
  ('COMPANY_ADDRESS', 'Av. Principal 123, Santiago', 'Dirección de la Empresa', 'Dirección física de la empresa', 'General', NOW(), NOW()),
  ('COMPANY_PHONE', '+56 9 1234 5678', 'Teléfono de la Empresa', 'Teléfono de contacto de la empresa', 'General', NOW(), NOW()),
  ('COMPANY_EMAIL', 'contacto@delmar.com', 'Email de la Empresa', 'Correo electrónico de contacto', 'General', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = NOW();

-- Sistema Category
INSERT INTO settings (key, value, name, description, category, created_at, updated_at)
VALUES
  ('TIMEZONE', 'America/Santiago', 'Zona Horaria', 'Zona horaria del sistema para reportes y visualización', 'Sistema', NOW(), NOW()),
  ('CURRENCY', 'CLP', 'Moneda', 'Moneda utilizada en el sistema', 'Sistema', NOW(), NOW()),
  ('CURRENCY_SYMBOL', '$', 'Símbolo de Moneda', 'Símbolo de la moneda', 'Sistema', NOW(), NOW()),
  ('LOW_STOCK_THRESHOLD', '10', 'Umbral de Stock Bajo', 'Cantidad mínima de productos para alertar stock bajo', 'Sistema', NOW(), NOW()),
  ('DATE_FORMAT', 'DD/MM/YYYY', 'Formato de Fecha', 'Formato de visualización de fechas', 'Sistema', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = NOW();

-- Recibos Category
INSERT INTO settings (key, value, name, description, category, created_at, updated_at)
VALUES
  ('RECEIPT_WIDTH_MM', '80', 'Ancho del Recibo (mm)', 'Ancho del papel del recibo en milímetros (usualmente 80mm)', 'Recibos', NOW(), NOW()),
  ('RECEIPT_HEADER', 'Gracias por su compra', 'Encabezado del Recibo', 'Texto que aparece en el encabezado del recibo', 'Recibos', NOW(), NOW()),
  ('RECEIPT_FOOTER', 'Vuelva Pronto!', 'Pie del Recibo', 'Texto que aparece al final del recibo', 'Recibos', NOW(), NOW()),
  ('RECEIPT_SHOW_LOGO', 'false', 'Mostrar Logo en Recibo', 'Mostrar el logo de la empresa en el recibo (true/false)', 'Recibos', NOW(), NOW()),
  ('RECEIPT_FONT_SIZE', '12', 'Tamaño de Fuente', 'Tamaño de fuente para el texto del recibo', 'Recibos', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = NOW();
