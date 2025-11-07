-- Seed inicial para roles y usuarios
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear roles si no existen
INSERT INTO "roles" ("id", "name", "description", "created_at", "updated_at")
VALUES
    (1, 'Admin', 'Administrador con acceso completo', NOW(), NOW()),
    (2, 'User', 'Usuario estándar', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Resetear secuencia de roles
SELECT setval('"roles_id_seq"', (SELECT MAX(id) FROM "roles"));

-- Crear usuario administrador
-- Password: admin123 (hasheado con bcrypt, 10 rounds)
INSERT INTO "users" ("id", "name", "email", "password", "is_active", "created_at", "updated_at")
VALUES
    (1, 'Administrador', 'admin@delmar.com', '$2b$10$3RBWHhj/c.RZQF7oSdFcYOmLpB2DvaoQhncGx9TuUtJoZLPtVaWZ.', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    "password" = '$2b$10$3RBWHhj/c.RZQF7oSdFcYOmLpB2DvaoQhncGx9TuUtJoZLPtVaWZ.',
    "updated_at" = NOW();

-- Crear usuario de prueba
-- Password: password123 (hasheado con bcrypt, 10 rounds)
INSERT INTO "users" ("id", "name", "email", "password", "is_active", "created_at", "updated_at")
VALUES
    (2, 'Usuario de Prueba', 'user@delmar.com', '$2b$10$erw8/kSqfHcnkFT4vwtVU.DWV/udrAqaJGB.znezAUAIXqNTlsWg2', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    "password" = '$2b$10$erw8/kSqfHcnkFT4vwtVU.DWV/udrAqaJGB.znezAUAIXqNTlsWg2',
    "updated_at" = NOW();

-- Resetear secuencia de usuarios
SELECT setval('"users_id_seq"', (SELECT MAX(id) FROM "users"));

-- Asignar rol Admin al administrador
INSERT INTO "user_roles" ("user_id", "role_id", "created_at")
VALUES
    (1, 1, NOW())
ON CONFLICT ("user_id", "role_id") DO NOTHING;

-- Asignar rol User al usuario de prueba
INSERT INTO "user_roles" ("user_id", "role_id", "created_at")
VALUES
    (2, 2, NOW())
ON CONFLICT ("user_id", "role_id") DO NOTHING;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✓ Roles y usuarios iniciales creados correctamente';
    RAISE NOTICE '  - Admin: admin@delmar.com / admin123';
    RAISE NOTICE '  - User:  user@delmar.com / password123';
END $$;
