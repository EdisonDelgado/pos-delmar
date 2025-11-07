# 🔑 Cómo Aplicar Seeds de Usuarios y Solucionar Error de Credenciales

## 📋 Resumen

He corregido dos problemas:
1. ✅ **Seeds de usuarios**: Ahora hay un archivo SQL que crea usuarios automáticamente
2. ✅ **UI de login**: Los errores ya no desaparecen rápidamente

## 🔧 Cambios Realizados

### 1. Seeds SQL Creados

**backend/seeds/01-users-seed.sql**
- Crea roles: Admin y User
- Crea usuarios con contraseñas hasheadas (bcrypt, 10 rounds)
- Asigna roles a usuarios

**Usuarios creados:**
```
Admin:
  Email: admin@delmar.com
  Password: admin123

User:
  Email: user@delmar.com
  Password: password123
```

### 2. Mejoras en LoginPage.tsx

- Los errores persisten hasta que empiezas a escribir
- Muestra las credenciales de prueba en pantalla
- Mejor UX con autoComplete

## 🚀 Solución: Aplicar los Seeds

Tienes **2 opciones** para aplicar los seeds:

---

### ✅ OPCIÓN 1: Recrear el Volumen de Docker (MÁS FÁCIL)

Esta opción elimina la base de datos actual y la recrea con los seeds.

```bash
# 1. Detener y eliminar TODO (incluido el volumen de la base de datos)
docker compose down -v

# 2. Reconstruir imágenes (para asegurar que frontend tenga las credenciales visibles)
docker compose build --no-cache frontend

# 3. Iniciar todo de nuevo
docker compose up -d

# 4. Verificar que los seeds se ejecutaron
docker compose logs postgres | grep "usuarios iniciales"

# Deberías ver:
# NOTICE:  ✓ Roles y usuarios iniciales creados correctamente
# NOTICE:    - Admin: admin@delmar.com / admin123
# NOTICE:    - User:  user@delmar.com / password123

# 5. Probar login
# Abre http://localhost e intenta:
# Email: admin@delmar.com
# Password: admin123
```

**⚠️ IMPORTANTE**: `docker compose down -v` **elimina todos los datos** de la base de datos. Si tienes datos que quieres conservar, usa la Opción 2.

---

### ✅ OPCIÓN 2: Ejecutar el Seed Manualmente (Conserva Datos)

Si quieres conservar tus datos actuales y solo agregar los usuarios:

```bash
# 1. Ejecutar el seed SQL en el contenedor de PostgreSQL
docker compose exec postgres psql -U postgres -d pos_delmar -f /docker-entrypoint-initdb.d/01-users-seed.sql

# Deberías ver:
# INSERT 0 2  (para roles)
# INSERT 0 2  (para usuarios)
# INSERT 0 2  (para user_roles)
# NOTICE:  ✓ Roles y usuarios iniciales creados correctamente

# 2. Verificar que los usuarios fueron creados
docker compose exec postgres psql -U postgres -d pos_delmar -c "SELECT id, name, email, \"isActive\" FROM users;"

# Deberías ver:
#  id |       name        |        email        | isActive
# ----+-------------------+---------------------+----------
#   1 | Administrador     | admin@delmar.com    | t
#   2 | Usuario de Prueba | user@delmar.com     | t

# 3. Verificar roles asignados
docker compose exec postgres psql -U postgres -d pos_delmar -c "SELECT u.email, r.name as role FROM users u JOIN user_roles ur ON u.id = ur.\"userId\" JOIN roles r ON r.id = ur.\"roleId\";"

# Deberías ver:
#        email        |  role
# --------------------+--------
#  admin@delmar.com   | Admin
#  user@delmar.com    | User

# 4. Reconstruir frontend para ver las credenciales en pantalla
docker compose up -d --build frontend

# 5. Probar login en http://localhost
```

---

## 🧪 Verificar que Todo Funciona

### 1. Verificar que frontend se reconstruyó

```bash
docker compose logs frontend | head -20
```

Deberías ver que se construyó recientemente.

### 2. Verificar conexión al backend

```bash
# Test de login con curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost" \
  -d '{"email":"admin@delmar.com","password":"admin123"}'
```

**Respuesta esperada (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@delmar.com",
    "isActive": true,
    "roles": ["Admin"]
  }
}
```

### 3. Probar en el navegador

1. Abre: http://localhost
2. Verás las credenciales en pantalla:
   ```
   Credenciales de prueba:
   admin@delmar.com / admin123
   ```
3. Ingresa las credenciales
4. El error (si hay) se quedará visible hasta que empieces a escribir
5. Si las credenciales son correctas, deberías entrar al dashboard

---

## 🐛 Troubleshooting

### Error: "Credenciales inválidas" persiste

**Causa:** Los seeds no se ejecutaron.

**Solución:**
```bash
# Verificar si el usuario existe
docker compose exec postgres psql -U postgres -d pos_delmar -c "SELECT * FROM users WHERE email='admin@delmar.com';"

# Si no existe, ejecutar:
docker compose exec postgres psql -U postgres -d pos_delmar -f /docker-entrypoint-initdb.d/01-users-seed.sql
```

### Error: "No such file or directory" al ejecutar seed

**Causa:** El volumen de seeds no está montado correctamente.

**Solución:**
```bash
# Verificar que el archivo existe en el contenedor
docker compose exec postgres ls -la /docker-entrypoint-initdb.d/

# Deberías ver:
# -rw-r--r-- 1 postgres postgres  2119 Nov  7 01-users-seed.sql
# -rw-r--r-- 1 postgres postgres  2877 Nov  7 02-settings-seed.sql

# Si no existe, copiar manualmente:
docker cp backend/seeds/01-users-seed.sql pos-delmar-postgres:/tmp/
docker compose exec postgres psql -U postgres -d pos_delmar -f /tmp/01-users-seed.sql
```

### Error persiste en la pantalla de login

**Causa:** El frontend no se reconstruyó.

**Solución:**
```bash
# Reconstruir solo el frontend
docker compose up -d --build frontend

# Limpiar caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)
```

### El frontend no muestra las credenciales en pantalla

**Causa:** El frontend no se reconstruyó con los nuevos cambios.

**Solución:**
```bash
# Pull de los últimos cambios
git pull origin claude/pos-nestjs-clean-011CUoHzD38JRsoMh5XNysQJ

# Reconstruir frontend sin caché
docker compose build --no-cache frontend

# Reiniciar
docker compose up -d frontend
```

---

## 📊 Estado Esperado

Después de aplicar los seeds:

✅ Base de datos tiene 2 usuarios
✅ Base de datos tiene 2 roles
✅ Usuario admin tiene rol Admin
✅ Usuario user tiene rol User
✅ Login con admin@delmar.com/admin123 funciona
✅ Login con user@delmar.com/password123 funciona
✅ Frontend muestra credenciales en pantalla
✅ Errores persisten hasta que escribes

---

## 🎯 Comando Todo-en-Uno

Si quieres hacer todo en un solo comando:

```bash
# Eliminar todo, reconstruir y iniciar limpio
docker compose down -v && \
docker compose build --no-cache && \
docker compose up -d && \
echo "⏳ Esperando 10 segundos para que todo inicie..." && \
sleep 10 && \
echo "🧪 Verificando seeds..." && \
docker compose exec postgres psql -U postgres -d pos_delmar -c "SELECT email FROM users;" && \
echo "🧪 Probando login..." && \
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost" \
  -d '{"email":"admin@delmar.com","password":"admin123"}' | grep -o '"access_token":"[^"]*"' && \
echo "✅ ¡Todo listo! Abre http://localhost"
```

---

## 📝 Notas Finales

1. **Contraseñas hasheadas**: Los hashes en el seed fueron generados con `bcrypt.hash('password', 10)` usando el mismo algoritmo que el backend.

2. **Seeds idempotentes**: El seed usa `ON CONFLICT DO UPDATE`, así que puedes ejecutarlo múltiples veces sin problemas.

3. **Orden de seeds**: Los archivos se ejecutan alfabéticamente:
   - `01-users-seed.sql` primero (crea usuarios y roles)
   - `02-settings-seed.sql` después (crea configuraciones)

4. **Logs de PostgreSQL**: Puedes ver si los seeds se ejecutaron con:
   ```bash
   docker compose logs postgres | grep -A 3 "usuarios iniciales"
   ```

---

## 🆘 Ayuda Adicional

Si nada de esto funciona, ejecuta el script de verificación:

```bash
./verify-docker.sh
```

Y compárteme la salida para diagnosticar el problema.

También puedes verificar específicamente la autenticación:

```bash
# Ver logs del backend relacionados con auth
docker compose logs backend | grep -i "login\|auth\|401"
```
