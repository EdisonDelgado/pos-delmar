-- Script para verificar y arreglar las asignaciones de roles a usuarios

-- 1. Verificar usuarios existentes
SELECT '=== USUARIOS ===' as info;
SELECT id, name, email, is_active FROM users;

-- 2. Verificar roles existentes
SELECT '=== ROLES ===' as info;
SELECT id, name, description FROM roles;

-- 3. Verificar asignaciones actuales
SELECT '=== ASIGNACIONES ACTUALES ===' as info;
SELECT
    u.name as usuario,
    r.name as rol
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id;

-- 4. Eliminar asignaciones existentes para evitar duplicados
DELETE FROM user_roles WHERE user_id IN (1, 2);

-- 5. Asignar rol Admin al administrador (user_id = 1, role_id = 1)
INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
VALUES (1, 1, NOW(), NOW())
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 6. Asignar rol User al usuario de prueba (user_id = 2, role_id = 2)
INSERT INTO user_roles (user_id, role_id, created_at, updated_at)
VALUES (2, 2, NOW(), NOW())
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 7. Verificar asignaciones después del fix
SELECT '=== ASIGNACIONES DESPUÉS DEL FIX ===' as info;
SELECT
    u.name as usuario,
    r.name as rol
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id;

-- 8. Mostrar mensaje de confirmación
SELECT '✅ Roles asignados correctamente' as resultado;
