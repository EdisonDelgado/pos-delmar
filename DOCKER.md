# POS Delmar - Docker Setup

Este documento describe cómo ejecutar la aplicación POS Delmar usando Docker y Docker Compose.

## Requisitos Previos

- Docker Engine 20.10 o superior
- Docker Compose v2.0 o superior
- Al menos 2GB de RAM disponible
- Puertos disponibles: 80, 3000, 5432

## Arquitectura

La aplicación consta de 3 servicios:

1. **postgres**: Base de datos PostgreSQL 15
2. **backend**: API NestJS (Node 20)
3. **frontend**: React + Vite servido con Nginx

## Inicio Rápido

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd pos-delmar
```

### 2. Configurar variables de entorno (opcional)

Las variables de entorno ya están configuradas en `docker-compose.yml` con valores por defecto. Si deseas personalizarlas, puedes crear un archivo `.env.docker`:

```bash
cp .env.docker.example .env.docker
```

### 3. Construir y ejecutar los contenedores

```bash
# Construir las imágenes
docker-compose build

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 4. Acceder a la aplicación

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000/api
- **API Docs (Swagger)**: http://localhost:3000/api/docs

### 5. Credenciales por defecto

- **Email**: admin@delmar.com
- **Password**: admin123

## Comandos Útiles

### Ver estado de los servicios

```bash
docker-compose ps
```

### Ver logs de un servicio específico

```bash
# Backend
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend

# PostgreSQL
docker-compose logs -f postgres
```

### Detener los servicios

```bash
docker-compose stop
```

### Detener y eliminar contenedores

```bash
docker-compose down
```

### Detener y eliminar contenedores + volúmenes (CUIDADO: elimina datos)

```bash
docker-compose down -v
```

### Reconstruir un servicio específico

```bash
# Reconstruir backend
docker-compose build backend
docker-compose up -d backend

# Reconstruir frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Ejecutar comandos dentro de un contenedor

```bash
# Acceder al shell del backend
docker-compose exec backend sh

# Acceder al shell de PostgreSQL
docker-compose exec postgres psql -U postgres -d pos_delmar
```

## Datos Semilla (Seeds)

La base de datos se inicializa automáticamente con:

- Roles: Admin y User
- Usuario administrador (admin@delmar.com / admin123)
- 15 configuraciones del sistema en la tabla `settings`

Los scripts de seed se encuentran en `backend/seeds/`.

## Persistencia de Datos

Los datos de PostgreSQL se almacenan en un volumen Docker llamado `postgres_data`. Esto significa que los datos persisten incluso si detienes los contenedores.

Para eliminar completamente los datos:

```bash
docker-compose down -v
```

## Configuración de Producción

### Variables de entorno importantes

En `docker-compose.yml`, asegúrate de cambiar estos valores para producción:

```yaml
# Backend
JWT_SECRET: "CAMBIAR-POR-UN-SECRET-SEGURO"
POSTGRES_PASSWORD: "CAMBIAR-POR-PASSWORD-SEGURO"
DB_SYNC: "false"  # NO usar sync en producción
DB_LOGGING: "false"

# CORS
CORS_ORIGIN: "https://tu-dominio.com"
```

### Uso con reverse proxy (nginx/traefik)

Si usas un reverse proxy, puedes cambiar los puertos en `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "127.0.0.1:3000:3000"  # Solo accesible localmente

  frontend:
    ports:
      - "127.0.0.1:8080:80"    # Solo accesible localmente

  postgres:
    ports:
      - "127.0.0.1:5432:5432"  # Solo accesible localmente
```

## Solución de Problemas

### El backend no se conecta a la base de datos

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   docker-compose ps postgres
   ```

2. Verifica los logs de PostgreSQL:
   ```bash
   docker-compose logs postgres
   ```

3. Verifica la conectividad:
   ```bash
   docker-compose exec backend ping postgres
   ```

### El frontend no se comunica con el backend

1. Verifica que el backend esté corriendo:
   ```bash
   docker-compose ps backend
   ```

2. Prueba el endpoint de health:
   ```bash
   curl http://localhost:3000/api
   ```

3. Verifica la variable `VITE_API_URL` en el frontend (debe apuntar a http://localhost:3000/api)

### Error "port is already allocated"

Si algún puerto ya está en uso, puedes cambiarlos en `docker-compose.yml`:

```yaml
ports:
  - "8080:80"     # Cambiar 80 por 8080
  - "3001:3000"   # Cambiar 3000 por 3001
  - "5433:5432"   # Cambiar 5432 por 5433
```

### Reconstruir completamente la aplicación

```bash
# Detener y eliminar todo
docker-compose down -v

# Eliminar imágenes antiguas
docker-compose build --no-cache

# Iniciar de nuevo
docker-compose up -d
```

## Desarrollo con Docker

Para desarrollo, puedes montar volúmenes para hot-reload:

```yaml
backend:
  volumes:
    - ./backend/src:/app/src
  command: npm run start:dev

frontend:
  volumes:
    - ./frontend/src:/app/src
  command: npm run dev
```

## Monitoreo

### Health Checks

Los servicios incluyen health checks configurados:

```bash
docker-compose ps
```

Verás el estado de salud en la columna "Status":
- `healthy`: Servicio funcionando correctamente
- `unhealthy`: Servicio con problemas
- `starting`: Servicio iniciando

### Recursos

Ver uso de recursos:

```bash
docker stats
```

## Backup y Restauración

### Backup de la base de datos

```bash
docker-compose exec postgres pg_dump -U postgres pos_delmar > backup.sql
```

### Restaurar desde backup

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d pos_delmar
```

## Licencia

Este proyecto está bajo la licencia especificada en el repositorio.

## Soporte

Para reportar problemas o sugerencias, por favor abre un issue en el repositorio.
