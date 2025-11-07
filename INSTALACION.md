# 🚀 Guía de Instalación - POS Delmar

## Requisitos Previos

- Docker Desktop instalado y corriendo
- Git instalado
- Puertos disponibles: 80 (frontend), 3000 (backend), 5432 (postgres)

## Instalación en Nueva Máquina

### Opción 1: Script Automático (Recomendado)

```bash
# 1. Clonar repositorio
git clone <URL_DEL_REPO>
cd pos-delmar

# 2. Dar permisos de ejecución al script
chmod +x init-setup.sh

# 3. Ejecutar script de inicialización
./init-setup.sh
```

El script automáticamente:
- ✅ Limpia contenedores y volúmenes existentes
- ✅ Construye las imágenes Docker
- ✅ Levanta los servicios
- ✅ Aplica seeds de base de datos
- ✅ Verifica usuarios y roles
- ✅ Prueba el login

### Opción 2: Manual

```bash
# 1. Clonar repositorio
git clone <URL_DEL_REPO>
cd pos-delmar

# 2. Detener y limpiar (si hay algo corriendo)
docker compose down -v

# 3. Construir y levantar servicios
docker compose build
docker compose up -d

# 4. Esperar 10 segundos
sleep 10

# 5. Aplicar seeds manualmente
docker compose exec postgres psql -U postgres -d pos_delmar -f /docker-entrypoint-initdb.d/01-users-seed.sql
docker compose exec postgres psql -U postgres -d pos_delmar -f /docker-entrypoint-initdb.d/02-verify-roles.sql

# 6. Verificar usuarios y roles
docker compose exec postgres psql -U postgres -d pos_delmar -c "
SELECT u.name as usuario, r.name as rol
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id;
"

# 7. Probar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delmar.com","password":"admin123"}' | jq .
```

## Verificación

### 1. Verificar servicios corriendo

```bash
docker compose ps
```

Deberías ver 3 servicios:
- `pos-delmar-frontend` (puerto 80)
- `pos-delmar-backend` (puerto 3000)
- `pos-delmar-postgres` (puerto 5432)

### 2. Verificar backend

```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-07T..."
}
```

### 3. Verificar frontend

Abre en el navegador: http://localhost

Deberías ver la pantalla de login.

### 4. Verificar login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delmar.com","password":"admin123"}' | jq .
```

Respuesta esperada:
```json
{
  "access_token": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@delmar.com",
    "isActive": true,
    "roles": ["Admin"]  ← ¡Debe tener roles!
  }
}
```

## Credenciales de Prueba

### Administrador
- **Email:** admin@delmar.com
- **Password:** admin123
- **Roles:** Admin

### Usuario
- **Email:** user@delmar.com
- **Password:** password123
- **Roles:** User

## Problemas Comunes

### Problema 1: Error 403 en todas las peticiones

**Causa:** Usuarios sin roles asignados.

**Solución:**
```bash
docker compose exec postgres psql -U postgres -d pos_delmar << 'EOF'
DELETE FROM user_roles WHERE user_id IN (1, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1), (2, 2);
EOF
```

Luego haz login de nuevo para obtener un nuevo token con roles.

### Problema 2: Tablas no existen

**Causa:** DB_SYNC no creó las tablas.

**Solución:**
```bash
docker compose down -v
docker compose up -d
```

### Problema 3: Puerto ocupado

**Causa:** Otro servicio está usando el puerto.

**Solución:**
```bash
# Verificar qué está usando el puerto
lsof -i :80   # o :3000 o :5432

# Detener el servicio conflictivo o cambiar el puerto en docker-compose.yml
```

### Problema 4: Seeds no se aplicaron

**Causa:** Los seeds solo se ejecutan cuando se crea el volumen por primera vez.

**Solución:**
```bash
# Opción 1: Recrear volumen (borra todos los datos)
docker compose down -v
docker compose up -d

# Opción 2: Aplicar manualmente
docker compose exec postgres psql -U postgres -d pos_delmar -f /docker-entrypoint-initdb.d/01-users-seed.sql
docker compose exec postgres psql -U postgres -d pos_delmar -f /docker-entrypoint-initdb.d/02-verify-roles.sql
```

## Comandos Útiles

```bash
# Ver logs
docker compose logs -f backend      # Logs del backend
docker compose logs -f frontend     # Logs del frontend
docker compose logs -f postgres     # Logs de PostgreSQL
docker compose logs -f              # Todos los logs

# Reiniciar servicios
docker compose restart backend      # Reiniciar solo backend
docker compose restart              # Reiniciar todos

# Detener servicios
docker compose down                 # Detener (mantiene volúmenes)
docker compose down -v              # Detener y borrar volúmenes

# Acceder a la base de datos
docker compose exec postgres psql -U postgres -d pos_delmar

# Ver estado de servicios
docker compose ps

# Ver usuarios en la BD
docker compose exec postgres psql -U postgres -d pos_delmar -c "SELECT id, name, email FROM users;"

# Ver roles asignados
docker compose exec postgres psql -U postgres -d pos_delmar -c "
SELECT u.name, r.name as rol
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id;
"
```

## Estructura de la Aplicación

```
pos-delmar/
├── backend/              # API NestJS
│   ├── src/
│   ├── seeds/           # Seeds SQL para inicialización
│   └── Dockerfile
├── frontend/            # App React + Vite
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml   # Orquestación de servicios
└── init-setup.sh       # Script de inicialización automática
```

## Desarrollo Local

Si quieres desarrollar sin Docker:

### Backend

```bash
cd backend
npm install
cp .env.example .env    # Configurar variables
npm run start:dev       # Puerto 3000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # Configurar VITE_API_URL
npm run dev            # Puerto 5173
```

## Migración a Otra Máquina

### Exportar datos (si es necesario)

```bash
# Exportar base de datos
docker compose exec postgres pg_dump -U postgres pos_delmar > backup.sql

# Copiar backup.sql a la nueva máquina
```

### En la nueva máquina

```bash
# 1. Clonar repositorio
git clone <URL_DEL_REPO>
cd pos-delmar

# 2. (Opcional) Importar backup
docker compose up -d postgres
sleep 5
docker compose exec -T postgres psql -U postgres -d pos_delmar < backup.sql

# 3. Ejecutar inicialización
./init-setup.sh
```

## Soporte

Si tienes problemas:

1. Revisa los logs: `docker compose logs -f`
2. Verifica que todos los servicios estén corriendo: `docker compose ps`
3. Ejecuta el script de verificación: `./init-setup.sh`
4. Consulta la sección de "Problemas Comunes" arriba

## URLs de Acceso

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000/api
- **API Documentation:** http://localhost:3000/api/docs
- **PostgreSQL:** localhost:5432 (usuario: postgres, password: postgres, db: pos_delmar)
