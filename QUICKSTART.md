# 🚀 Inicio Rápido - POS Delmar

## Desarrollo Local (Modo Rápido)

### 1️⃣ Iniciar Backend

```bash
# Terminal 1
cd backend
npm install
npm run start:dev
```

Deberías ver:
```
🚀 Application is running on: http://localhost:3000/api
📚 API Documentation available at: http://localhost:3000/api/docs
🌐 CORS enabled for origins: http://localhost:5173,http://localhost:4173,http://localhost:3001
```

### 2️⃣ Iniciar Frontend

```bash
# Terminal 2
cd frontend
npm install
npm run dev
```

Deberías ver:
```
VITE v7.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 3️⃣ Acceder a la Aplicación

1. **Frontend:** http://localhost:5173
2. **API:** http://localhost:3000/api
3. **Swagger Docs:** http://localhost:3000/api/docs

### 🔑 Credenciales de Prueba

**Usuario Administrador:**
- Email: `admin@delmar.com`
- Password: `admin123`

## ⚠️ Problemas Comunes

### "Network error. Please check your connection"

**Causa:** El backend no está corriendo o hay error de CORS.

**Solución:**
```bash
# 1. Verificar que backend esté corriendo
curl http://localhost:3000/api/auth/login
# Debe responder (aunque sea con error 400)

# 2. Verificar variables de entorno
cd backend && cat .env | grep CORS_ORIGIN
# Debe contener: http://localhost:5173

cd frontend && cat .env | grep VITE_API_URL
# Debe contener: http://localhost:3000/api

# 3. Reiniciar ambos servicios
```

### Error "Port 3000 already in use"

```bash
# Encontrar el proceso
lsof -i :3000

# Matar el proceso
kill -9 <PID>
```

### Base de datos no conecta

```bash
# Iniciar PostgreSQL con Docker
docker run -d --name pos-postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pos_delmar \
  postgres:15-alpine

# Verificar que esté corriendo
docker ps | grep postgres
```

## 📝 Checklist de Verificación

Antes de intentar hacer login:

- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] PostgreSQL corriendo en puerto 5432
- [ ] Variables de entorno configuradas correctamente
- [ ] Sin errores en la consola del backend
- [ ] Sin errores en la consola del navegador (F12)

## 🐛 Debugging

### Ver logs del backend

El backend debería mostrar:
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [RoutesResolver] AuthController {/api/auth}
[Nest] INFO [RouterExplorer] Mapped {/api/auth/login, POST} route
🚀 Application is running on: http://localhost:3000/api
🌐 CORS enabled for origins: http://localhost:5173,...
```

### Ver logs del navegador

1. Abre http://localhost:5173
2. Presiona F12 (DevTools)
3. Ve a la pestaña **Network**
4. Intenta hacer login
5. Busca la petición a `/api/auth/login`

**Petición exitosa:**
- Status: 200 o 201
- Response tiene `access_token`

**Error de CORS:**
- Status: (failed) o sin respuesta
- Error: "CORS policy..."

**Error de conexión:**
- Status: (failed)
- Error: "Network error"
- Causa: Backend no está corriendo

## 🔄 Reiniciar Todo

Si nada funciona, reinicia todo:

```bash
# 1. Detener todo
pkill -f "node"

# 2. Limpiar
cd backend
rm -rf node_modules dist
npm install

cd ../frontend
rm -rf node_modules dist
npm install

# 3. Iniciar backend
cd ../backend
npm run start:dev

# 4. Iniciar frontend (en nueva terminal)
cd ../frontend
npm run dev
```

## 📞 Soporte

Si sigues teniendo problemas:

1. Verifica que tienes Node.js 20+ instalado: `node --version`
2. Verifica que tienes PostgreSQL corriendo: `psql -U postgres -c "SELECT version();"`
3. Revisa los logs del backend en busca de errores
4. Revisa la consola del navegador en busca de errores
5. Asegúrate de que los puertos 3000, 5173 y 5432 no estén ocupados

## 📚 Documentación Adicional

- [README.md](./README.md) - Documentación completa
- [DOCKER.md](./DOCKER.md) - Setup con Docker
- [backend/README.md](./backend/README.md) - Documentación del backend
- [frontend/README.md](./frontend/README.md) - Documentación del frontend
