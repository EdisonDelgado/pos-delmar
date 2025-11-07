# 🧪 Guía Rápida: Probar Login con Docker

## Cambios Realizados

### Backend ✅
- **Logs detallados** en `auth.service.ts` y `users.service.ts`
- Muestra exactamente dónde falla la autenticación
- Logs de bcrypt.compare() para ver si las contraseñas coinciden

### Frontend ✅
- **Arreglado re-renderizado** en LoginPage
- Ahora los errores persisten hasta que el usuario escribe
- No hay navegaciones múltiples que causen pérdida de estado

### Scripts ✅
- `fix-seeds.sh` para verificar y aplicar seeds

---

## 🚀 Pasos para Probar

### 1. Levantar Docker con rebuild

```bash
cd /home/user/pos-delmar

# Detener servicios si están corriendo
docker compose down

# Reconstruir backend con los nuevos logs
docker compose build backend

# Levantar todos los servicios
docker compose up -d

# Esperar 10 segundos para que los servicios estén listos
sleep 10
```

### 2. Verificar que los servicios están corriendo

```bash
docker compose ps
```

Deberías ver 3 servicios corriendo:
- `postgres` (puerto 5432)
- `backend` (puerto 3000)
- `frontend` (puerto 80)

### 3. Verificar salud de los servicios

```bash
# Verificar backend
curl -s http://localhost:3000/api/health | jq .

# Verificar frontend
curl -s http://localhost:80 | head -10
```

### 4. Verificar que los usuarios existen en la base de datos

```bash
docker compose exec postgres psql -U delmar -d pos_delmar -c "SELECT id, name, email, is_active FROM users;"
```

**Deberías ver:**
```
 id |      name       |       email       | is_active
----+-----------------+-------------------+-----------
  1 | Administrador   | admin@delmar.com  | t
  2 | Usuario de Prueba | user@delmar.com | t
```

**Si NO hay usuarios**, ejecuta:
```bash
# Aplicar seeds manualmente
docker compose exec postgres psql -U delmar -d pos_delmar -f /docker-entrypoint-initdb.d/01-users-seed.sql
```

### 5. Probar login con curl

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delmar.com","password":"admin123"}' \
  -v
```

**Si funciona**, deberías ver:
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@delmar.com",
    "isActive": true,
    "roles": ["Admin"]
  }
}
```

**Si falla (401)**, continúa al paso 6.

### 6. Ver logs detallados del backend

```bash
# Ver logs en tiempo real
docker compose logs -f backend

# O ver los últimos 50 logs
docker compose logs backend | tail -50
```

**Busca estos logs:**

```
🔐 [AuthService] Validando usuario: admin@delmar.com
✓ [AuthService] Usuario encontrado: { id: 1, email: 'admin@delmar.com', ... }
🔑 [UsersService] Comparando contraseñas: { plainPasswordLength: 8, hashedPasswordLength: 60, ... }
🔑 [UsersService] Resultado de comparación: ✅ Coincide (o ❌ No coincide)
```

### 7. Probar login desde el frontend

1. Abre http://localhost en tu navegador
2. Abre la consola del navegador (F12)
3. Intenta login con:
   - Email: `admin@delmar.com`
   - Password: `admin123`

**En la consola del navegador verás:**
```
📝 Intentando login con: { email: 'admin@delmar.com', password: '***' }
```

**En los logs del backend verás:**
```
🔐 [AuthService] Validando usuario: admin@delmar.com
```

### 8. Si el login funciona pero redirecciona al login de nuevo

Verifica en la consola del navegador:
```
✅ Login exitoso, el useEffect manejará la navegación
👤 Usuario ya autenticado, redirigiendo al dashboard
✅ Acceso permitido a ruta protegida
```

Si ves estos logs pero aún así vuelves al login, el problema está en el ProtectedRoute o en la persistencia del estado.

---

## 🔍 Diagnóstico de Problemas Comunes

### Problema 1: Backend no inicia
```bash
docker compose logs backend
```
Busca errores de conexión a PostgreSQL o errores de sintaxis.

### Problema 2: No hay usuarios en la base de datos
```bash
# Recrear volumen de PostgreSQL
docker compose down -v
docker compose up -d
```
Esto ejecutará los seeds automáticamente.

### Problema 3: Login falla con 401 pero usuario existe
Verifica los logs del backend:
```bash
docker compose logs backend | grep -A 5 "Comparando contraseñas"
```

Si ves `❌ No coincide`, el problema es el hash de la contraseña.

**Solución:**
```bash
# Actualizar contraseña manualmente con hash correcto
docker compose exec postgres psql -U delmar -d pos_delmar -c "
UPDATE users
SET password = '\$2b\$10\$3RBWHhj/c.RZQF7oSdFcYOmLpB2DvaoQhncGx9TuUtJoZLPtVaWZ.'
WHERE email = 'admin@delmar.com';
"
```

### Problema 4: CORS error
Verifica la variable de entorno en `docker-compose.yml`:
```yaml
CORS_ORIGIN: http://localhost,http://localhost:80,http://frontend
```

Y reinicia:
```bash
docker compose restart backend
```

---

## 📊 Qué Esperar Ver en los Logs

### Login Exitoso (Backend)
```
🚀 [AuthService] Intento de login: admin@delmar.com
🔐 [AuthService] Validando usuario: admin@delmar.com
✓ [AuthService] Usuario encontrado: { id: 1, email: 'admin@delmar.com', ... }
🔑 [UsersService] Comparando contraseñas: { plainPasswordLength: 8, ... }
🔑 [UsersService] Resultado de comparación: ✅ Coincide
✅ [AuthService] Validación exitosa
🎉 [AuthService] Login exitoso: { userId: 1, email: 'admin@delmar.com', ... }
```

### Login Exitoso (Frontend)
```
📝 Intentando login con: { email: 'admin@delmar.com', password: '***' }
🎉 Login fulfilled: { token: 'eyJhbGciOiJIUzI1...', user: 'admin@delmar.com', roles: ['Admin'] }
✅ Login exitoso, el useEffect manejará la navegación
👤 Usuario ya autenticado, redirigiendo al dashboard
🔒 ProtectedRoute - isAuthenticated: true user: admin@delmar.com
✅ Usuario tiene roles requeridos
✅ Acceso permitido a ruta protegida
```

### Login Fallido (Contraseña Incorrecta)
```
🚀 [AuthService] Intento de login: admin@delmar.com
🔐 [AuthService] Validando usuario: admin@delmar.com
✓ [AuthService] Usuario encontrado: { id: 1, ... }
🔑 [UsersService] Comparando contraseñas: { plainPasswordLength: 8, ... }
🔑 [UsersService] Resultado de comparación: ❌ No coincide
🔑 [AuthService] Validación de contraseña: ❌ Inválida
❌ [AuthService] Login falló - Credenciales inválidas
```

### Login Fallido (Usuario No Existe)
```
🚀 [AuthService] Intento de login: noexiste@delmar.com
🔐 [AuthService] Validando usuario: noexiste@delmar.com
❌ [AuthService] Usuario no encontrado: noexiste@delmar.com
❌ [AuthService] Login falló - Credenciales inválidas
```

---

## 🎯 Script Todo-en-Uno

Ejecuta este script para hacer todas las verificaciones:

```bash
#!/bin/bash
echo "🧪 Prueba Completa de Login con Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Rebuild y levantar servicios
echo "📦 Reconstruyendo backend..."
docker compose build backend
echo "🚀 Levantando servicios..."
docker compose up -d
echo "⏳ Esperando 10 segundos..."
sleep 10

# 2. Verificar servicios
echo ""
echo "📊 Estado de servicios:"
docker compose ps

# 3. Verificar salud
echo ""
echo "🏥 Salud del backend:"
curl -s http://localhost:3000/api/health | jq .

# 4. Verificar usuarios
echo ""
echo "👥 Usuarios en la base de datos:"
docker compose exec postgres psql -U delmar -d pos_delmar -c "SELECT id, name, email, is_active FROM users;"

# 5. Probar login
echo ""
echo "🔐 Probando login..."
HTTP_CODE=$(curl -s -o /tmp/login-response.json -w "%{http_code}" \
  -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delmar.com","password":"admin123"}')

echo "HTTP Status: $HTTP_CODE"
echo "Respuesta:"
cat /tmp/login-response.json | jq .

# 6. Mostrar logs recientes
echo ""
echo "📜 Últimos logs del backend:"
docker compose logs backend | tail -30

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Prueba completa"
```

Guarda esto en `test-login.sh`, hazlo ejecutable y córrelo:
```bash
chmod +x test-login.sh
./test-login.sh
```

---

## 📝 Credenciales de Prueba

**Administrador:**
- Email: `admin@delmar.com`
- Password: `admin123`
- Roles: `Admin`

**Usuario:**
- Email: `user@delmar.com`
- Password: `password123`
- Roles: `User`

---

## 🆘 Si Nada Funciona

1. **Limpiar completamente Docker:**
   ```bash
   docker compose down -v
   docker system prune -f
   docker compose build --no-cache
   docker compose up -d
   ```

2. **Verificar variables de entorno:**
   ```bash
   docker compose exec backend env | grep -E "(DB_|CORS_|JWT_)"
   ```

3. **Conectarse manualmente a PostgreSQL:**
   ```bash
   docker compose exec postgres psql -U delmar -d pos_delmar
   ```

   Luego ejecuta:
   ```sql
   SELECT * FROM users;
   SELECT * FROM roles;
   SELECT * FROM user_roles;
   ```

4. **Ver logs completos:**
   ```bash
   docker compose logs --tail=200
   ```
