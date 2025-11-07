-- Script de verificación y corrección de roles
-- Se ejecuta después de crear usuarios para asegurar que tienen roles asignados

-- Verificar si los usuarios tienen roles asignados
DO $$
DECLARE
    admin_has_role INTEGER;
    user_has_role INTEGER;
BEGIN
    -- Contar roles del admin
    SELECT COUNT(*) INTO admin_has_role
    FROM user_roles
    WHERE user_id = 1;

    -- Contar roles del usuario de prueba
    SELECT COUNT(*) INTO user_has_role
    FROM user_roles
    WHERE user_id = 2;

    -- Si el admin no tiene roles, asignar
    IF admin_has_role = 0 THEN
        INSERT INTO user_roles (user_id, role_id, created_at)
        VALUES (1, 1, NOW())
        ON CONFLICT (user_id, role_id) DO NOTHING;
        RAISE NOTICE '✓ Rol Admin asignado al administrador';
    ELSE
        RAISE NOTICE '✓ El administrador ya tiene roles asignados';
    END IF;

    -- Si el usuario de prueba no tiene roles, asignar
    IF user_has_role = 0 THEN
        INSERT INTO user_roles (user_id, role_id, created_at)
        VALUES (2, 2, NOW())
        ON CONFLICT (user_id, role_id) DO NOTHING;
        RAISE NOTICE '✓ Rol User asignado al usuario de prueba';
    ELSE
        RAISE NOTICE '✓ El usuario de prueba ya tiene roles asignados';
    END IF;
END $$;
