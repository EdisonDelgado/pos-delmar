# 🔍 Debugging Docker Network - POS Delmar

## 🔧 Cambios Realizados para Corregir CORS

### Problema Original
El frontend no podía conectarse al backend debido a:
1. CORS mal configurado: `http://localhost:80` (incorrecto)
2. Faltaba `VITE_API_URL` como build arg
3. El frontend no sabía dónde estaba el backend

### Solución Implementada

#### 1. docker-compose.yml
```yaml
# Backend - Múltiples orígenes CORS permitidos
CORS_ORIGIN: http://localhost,http://localhost:80,http://frontend

# Frontend - Build arg para Vite
build:
  args:
    VITE_API_URL: http://localhost:3000/api
```

**Explicación:**
- `http://localhost` - Navegador accediendo desde puerto 80 (default)
- `http://localhost:80` - Explícito con puerto
- `http://frontend` - Comunicación interna entre contenedores (si fuera necesario)

## 🚀 Cómo Levantar y Probar Docker

### Paso 1: Limpiar Todo (Opcional pero Recomendado)

```bash
# Detener todos los contenedores
docker compose down

# Eliminar imágenes antiguas (para forzar rebuild)
docker compose down --rmi all

# Limpiar volúmenes (⚠️ ESTO BORRA LA BASE DE DATOS)
docker compose down -v

# Limpiar todo el caché de Docker (opcional)
docker system prune -a
```

### Paso 2: Build con Logs Detallados

```bash
# Build sin caché para asegurar que todo se reconstruya
docker compose build --no-cache --progress=plain

# O build normal
docker compose build
```

**Verifica que veas:**
```
Building backend...
[+] Building 45.2s (12/12) FINISHED

Building frontend...
ARG VITE_API_URL=http://localhost:3000/api
[+] Building 52.1s (15/15) FINISHED
```

### Paso 3: Iniciar Servicios

```bash
# Iniciar en modo detached (background)
docker compose up -d

# O ver logs en tiempo real
docker compose up
```

**Deberías ver:**
```
[+] Running 3/3
 ✔ Container pos-delmar-postgres   Healthy
 ✔ Container pos-delmar-backend    Started
 ✔ Container pos-delmar-frontend   Started
```

### Paso 4: Verificar Estado de los Contenedores

```bash
# Ver estado
docker compose ps
```

**Salida esperada:**
```
NAME                    STATUS              PORTS
pos-delmar-postgres     Up (healthy)        0.0.0.0:5432->5432/tcp
pos-delmar-backend      Up (healthy)        0.0.0.0:3000->3000/tcp
pos-delmar-frontend     Up                  0.0.0.0:80->80/tcp
```

### Paso 5: Verificar Logs

```bash
# Ver logs de todos los servicios
docker compose logs

# Ver logs del backend específicamente
docker compose logs backend

# Ver logs en tiempo real
docker compose logs -f backend

# Ver últimas 50 líneas
docker compose logs --tail=50 backend
```

**Backend debe mostrar:**
```
🚀 Application is running on: http://localhost:3000/api
📚 API Documentation available at: http://localhost:3000/api/docs
🌐 CORS enabled for origins: http://localhost,http://localhost:80,http://frontend
```

**Frontend debe mostrar (nginx):**
```
/docker-entrypoint.sh: Configuration complete; ready for start up
```

## 🧪 Pruebas de Conexión

### Test 1: Verificar que Backend Responde

```bash
# Desde tu máquina (fuera de Docker)
curl http://localhost:3000/api

# Debe responder con: {"statusCode":404,"message":"Cannot GET /api"}
# Esto es BUENO, significa que el backend está respondiendo
```

### Test 2: Verificar Endpoint de Auth

```bash
# Debe dar error 400 (esperado, falta el body)
curl -X POST http://localhost:3000/api/auth/login

# Debe responder algo como:
# {"message":["email should not be empty",...],"error":"Bad Request","statusCode":400}
```

### Test 3: Verificar CORS Headers

```bash
# Probar preflight CORS request
curl -X OPTIONS http://localhost:3000/api/auth/login \
  -H "Origin: http://localhost" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Busca en la respuesta:**
```
< access-control-allow-origin: http://localhost
< access-control-allow-methods: GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
< access-control-allow-credentials: true
```

### Test 4: Verificar Frontend

```bash
# Verificar que Nginx está sirviendo el frontend
curl http://localhost/ | grep "<!doctype html>"

# Debe mostrar HTML
```

### Test 5: Login Completo desde cURL

```bash
# Intentar login completo
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost" \
  -d '{"email":"admin@delmar.com","password":"admin123"}' \
  -v
```

**Respuesta esperada (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@delmar.com",
    ...
  }
}
```

## 🌐 Probar en el Navegador

### 1. Acceder a la Aplicación

Abre: http://localhost

### 2. Abrir DevTools

Presiona `F12` o `Ctrl+Shift+I`

### 3. Ir a Network Tab

### 4. Intentar Login

- Email: `admin@delmar.com`
- Password: `admin123`

### 5. Verificar Request

Busca la petición a `login` en Network:

**Si funciona correctamente:**
```
Request URL: http://localhost:3000/api/auth/login
Request Method: POST
Status Code: 200 OK
```

**Headers que debes ver:**
```
access-control-allow-origin: http://localhost
access-control-allow-credentials: true
```

**Si falla con CORS:**
```
Status: (failed)
Error: CORS policy: No 'Access-Control-Allow-Origin' header
```

## 🐛 Troubleshooting

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Causa:** El backend no está permitiendo el origen del frontend.

**Solución:**
```bash
# 1. Verificar configuración CORS en el backend
docker compose exec backend env | grep CORS_ORIGIN

# Debe mostrar: CORS_ORIGIN=http://localhost,http://localhost:80,http://frontend

# 2. Si está mal, reconstruir backend
docker compose up -d --force-recreate --build backend

# 3. Verificar logs
docker compose logs backend | grep CORS
# Debe mostrar: 🌐 CORS enabled for origins: http://localhost,...
```

### Error: "Network error. Please check your connection"

**Causa:** El backend no está corriendo o no es accesible.

**Solución:**
```bash
# 1. Verificar que backend esté corriendo
docker compose ps backend

# 2. Verificar logs por errores
docker compose logs backend

# 3. Reiniciar backend
docker compose restart backend

# 4. Si sigue fallando, reconstruir
docker compose up -d --force-recreate --build backend
```

### Error: Backend no inicia (crashea)

**Posibles causas:**
1. PostgreSQL no está listo
2. Error en las variables de entorno
3. Error en el código

**Solución:**
```bash
# 1. Verificar logs completos
docker compose logs backend

# 2. Verificar que PostgreSQL esté healthy
docker compose ps postgres
# Debe mostrar: (healthy)

# 3. Verificar conexión a base de datos
docker compose exec backend wget -O- http://localhost:3000/api
```

### Frontend muestra pantalla blanca

**Solución:**
```bash
# 1. Verificar logs de Nginx
docker compose logs frontend

# 2. Verificar que los archivos estén en el contenedor
docker compose exec frontend ls -la /usr/share/nginx/html/

# Debe mostrar: index.html, assets/, etc.

# 3. Reconstruir frontend
docker compose up -d --force-recreate --build frontend
```

### Puerto 80 o 3000 ocupado

```bash
# Encontrar qué proceso usa el puerto
sudo lsof -i :80   # o :3000

# Matar el proceso
sudo kill -9 <PID>

# O cambiar los puertos en docker-compose.yml
ports:
  - "8080:80"    # Frontend en puerto 8080
  - "3001:3000"  # Backend en puerto 3001

# Actualizar VITE_API_URL y CORS_ORIGIN en docker-compose.yml
```

## 🔄 Comandos Útiles

```bash
# Ver todos los contenedores
docker compose ps -a

# Reiniciar un servicio específico
docker compose restart backend

# Ver logs en tiempo real
docker compose logs -f

# Entrar a un contenedor
docker compose exec backend sh
docker compose exec frontend sh

# Ver variables de entorno de un contenedor
docker compose exec backend env

# Reconstruir y reiniciar todo
docker compose up -d --build

# Detener todo
docker compose down

# Detener y eliminar volúmenes
docker compose down -v
```

## 📊 Checklist de Verificación

Antes de reportar un error, verifica:

- [ ] `docker compose ps` muestra todos los servicios "Up"
- [ ] `docker compose ps postgres` muestra "(healthy)"
- [ ] `docker compose logs backend` muestra "Application is running"
- [ ] `docker compose logs backend` muestra "CORS enabled"
- [ ] `curl http://localhost:3000/api` responde (aunque sea con 404)
- [ ] `curl http://localhost/` muestra HTML
- [ ] En el navegador, F12 → Network no muestra errores de CORS
- [ ] En el navegador, F12 → Console no muestra errores

## 📝 Información para Debug

Si necesitas ayuda, proporciona esta información:

```bash
# 1. Estado de contenedores
docker compose ps

# 2. Logs del backend (últimas 100 líneas)
docker compose logs --tail=100 backend

# 3. Variables de entorno del backend
docker compose exec backend env | grep -E "CORS|VITE|DB_"

# 4. Versión de Docker
docker --version
docker compose version

# 5. Captura de pantalla del error en el navegador (F12 → Network)
```

## 🎯 Flujo de Comunicación Correcto

```
Usuario en Navegador (http://localhost)
    ↓
Frontend Nginx (contenedor, puerto 80)
    ↓
[JavaScript compilado con VITE_API_URL=http://localhost:3000/api]
    ↓
Request sale del navegador hacia http://localhost:3000/api
    ↓
Backend NestJS (contenedor, puerto 3000)
    ↓
Backend verifica CORS: ¿Origin: http://localhost está en CORS_ORIGIN?
    ↓
✅ SÍ → Responde con headers CORS correctos
    ↓
Frontend recibe respuesta y la procesa
```

## 🔑 Variables Clave

| Variable | Ubicación | Valor | Propósito |
|----------|-----------|-------|-----------|
| `CORS_ORIGIN` | Backend | `http://localhost,http://localhost:80,http://frontend` | Orígenes permitidos por CORS |
| `VITE_API_URL` | Frontend build | `http://localhost:3000/api` | URL del backend desde el navegador |
| `DB_HOST` | Backend | `postgres` | Nombre del servicio PostgreSQL en Docker |

## 🎓 Conceptos Importantes

### ¿Por qué VITE_API_URL es "localhost" y no "backend"?

Porque **el código JavaScript se ejecuta en el navegador del usuario**, no en el contenedor Docker. El navegador necesita acceder al backend mediante `localhost:3000`, ya que Docker expone el puerto 3000 del backend al host.

### ¿Por qué CORS_ORIGIN incluye "http://localhost"?

Porque cuando el navegador hace una petición desde `http://localhost` (puerto 80, el frontend) hacia `http://localhost:3000/api` (backend), el header `Origin` de la petición es `http://localhost`. El backend debe permitir ese origen.

### ¿Por qué DB_HOST es "postgres" y no "localhost"?

Porque **dentro de Docker**, los contenedores se comunican usando los nombres de servicio definidos en `docker-compose.yml`. El backend corre dentro de un contenedor y necesita conectarse a otro contenedor (postgres) usando su nombre de servicio.
