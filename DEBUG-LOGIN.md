# 🐛 Debugging del Problema de Login y Redirección

## 📋 Resumen del Problema

Tu reporte indica:
- ✅ Backend funciona correctamente (query SQL se ejecuta)
- ✅ Backend encuentra al usuario admin@delmar.com
- ❌ Después del login, redirige de vuelta al login
- ❓ Posible problema con navegación, perfila miento de usuario, o routing

## 🔍 Debugging Agregado

He agregado console.logs extensivos en todo el flujo de autenticación para identificar exactamente dónde falla.

### Logs que Verás

#### 1. Al Cargar la Aplicación
```
🔄 Cargando estado inicial de auth: { token: null, isAuthenticated: false }
```
O si ya tenías una sesión previa:
```
🔄 Cargando estado inicial de auth: { token: "eyJ...", user: {...}, isAuthenticated: true }
```

#### 2. Al Intentar Acceder a una Ruta Protegida
```
🔒 ProtectedRoute - isAuthenticated: false, user: undefined
❌ No autenticado, redirigiendo a /login
```

#### 3. Al Hacer Login
```
🎉 Login fulfilled: {
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: "admin@delmar.com",
  roles: ["Admin"]
}
✅ Login exitoso, navegando a dashboard
```

#### 4. Al Entrar al Dashboard (Después del Login)
```
🔒 ProtectedRoute - isAuthenticated: true, user: admin@delmar.com
✅ Acceso permitido a ruta protegida
```

#### 5. Si el Login Falla
```
❌ Login rejected: { message: "Credenciales inválidas" }
❌ Login falló: { payload: {...} }
```

---

## 🧪 Cómo Probar

### Paso 1: Rebuild del Frontend

```bash
# Reconstruir frontend con los nuevos logs
docker compose up -d --build frontend

# Esperar que termine
docker compose logs -f frontend
```

### Paso 2: Abrir DevTools

1. Abre http://localhost en tu navegador
2. Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux) o `Cmd+Option+I` (Mac)
3. Ve a la pestaña **Console**

### Paso 3: Limpiar Console y LocalStorage

```javascript
// Pega esto en la consola del navegador
console.clear();
localStorage.clear();
console.log('✅ Console y localStorage limpiados');
location.reload();
```

### Paso 4: Intentar Login

1. Recarga la página (deberías ver el log inicial)
2. Ingresa credenciales: `admin@delmar.com` / `admin123`
3. Haz click en "Iniciar Sesión"
4. **OBSERVA LOS LOGS** en la consola

---

## 🎯 Qué Buscar en los Logs

### ✅ Escenario Exitoso (Esperado)

```
1. 🔄 Cargando estado inicial de auth: { isAuthenticated: false }
2. 🔒 ProtectedRoute - isAuthenticated: false, user: undefined
3. ❌ No autenticado, redirigiendo a /login
4. (Usuario ingresa credenciales y hace submit)
5. 🎉 Login fulfilled: { token: "...", user: "admin@delmar.com", roles: ["Admin"] }
6. ✅ Login exitoso, navegando a dashboard
7. 🔒 ProtectedRoute - isAuthenticated: true, user: admin@delmar.com
8. ✅ Acceso permitido a ruta protegida
9. (Dashboard se muestra)
```

### ❌ Escenario 1: Login Falla por Credenciales

```
1. 🔄 Cargando estado inicial de auth: { isAuthenticated: false }
2. (Usuario ingresa credenciales y hace submit)
3. ❌ Login rejected: { message: "Credenciales inválidas" }
4. ❌ Login falló: { payload: {...} }
```

**Causa:** Usuario no existe o contraseña incorrecta.

**Solución:** Aplicar seeds (ver COMO-APLICAR-SEEDS.md)

### ❌ Escenario 2: Login Exitoso Pero Redirige de Vuelta

```
1. 🔄 Cargando estado inicial de auth: { isAuthenticated: false }
2. 🎉 Login fulfilled: { token: "...", user: "admin@delmar.com", roles: ["Admin"] }
3. ✅ Login exitoso, navegando a dashboard
4. 🔒 ProtectedRoute - isAuthenticated: false, user: undefined  ← ⚠️ PROBLEMA AQUÍ
5. ❌ No autenticado, redirigiendo a /login
```

**Causa:** El estado de Redux no se está actualizando correctamente o localStorage no está guardando.

**Solución:**
1. Verificar que localStorage.setItem() funciona:
   ```javascript
   // En la consola, después del login
   console.log('Token:', localStorage.getItem('token'));
   console.log('User:', localStorage.getItem('user'));
   ```
2. Si localStorage está vacío, hay un problema con authSlice guardando el estado
3. Revisar errores de CORS o red que impidan la respuesta

### ❌ Escenario 3: Loop de Redirección Infinito

```
🔒 ProtectedRoute - isAuthenticated: false
❌ No autenticado, redirigiendo a /login
👤 Usuario ya autenticado, redirigiendo al dashboard
🔒 ProtectedRoute - isAuthenticated: false
❌ No autenticado, redirigiendo a /login
👤 Usuario ya autenticado, redirigiendo al dashboard
(se repite infinitamente)
```

**Causa:** Estado inconsistente entre LoginPage y ProtectedRoute.

**Solución:** Ver sección "Soluciones Avanzadas" abajo.

---

## 🔧 Verificaciones Adicionales

### Verificar Estado de Redux en Tiempo Real

Agrega esta extensión de Chrome/Firefox:
- **Redux DevTools** - https://github.com/reduxjs/redux-devtools

Con esta extensión puedes ver:
- Estado actual de `auth`
- Cada action que se dispara (login.pending, login.fulfilled, etc.)
- Cómo cambia el estado después de cada action

### Verificar LocalStorage

```javascript
// En la consola del navegador después del login
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
console.log('User parsed:', JSON.parse(localStorage.getItem('user')));
```

**Respuesta esperada:**
```javascript
Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
User: "{\"id\":1,\"name\":\"Administrador\",\"email\":\"admin@delmar.com\",\"isActive\":true,\"roles\":[\"Admin\"]}"
User parsed: {
  id: 1,
  name: "Administrador",
  email: "admin@delmar.com",
  isActive: true,
  roles: ["Admin"]
}
```

### Verificar Respuesta del Backend

```bash
# Probar login con curl para ver respuesta exacta
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost" \
  -d '{"email":"admin@delmar.com","password":"admin123"}' \
  -v
```

**Busca:**
- Status Code: 200 (o 201)
- Header: `access-control-allow-origin: http://localhost`
- Body: JSON con `access_token` y `user`

---

## 🛠️ Soluciones Avanzadas

### Solución 1: Limpiar Todo y Empezar de Nuevo

```bash
# Detener todo
docker compose down

# Limpiar localStorage del navegador
# (F12 → Application → Local Storage → http://localhost → Clear All)

# Reconstruir y iniciar
docker compose build --no-cache frontend
docker compose up -d

# Abrir http://localhost con DevTools abierto
```

### Solución 2: Verificar que el Backend Responde Correctamente

```bash
# Ver logs del backend durante el login
docker compose logs -f backend

# Deberías ver el query SQL que mostraste:
# SELECT "User"."id", "User"."name", "User"."email"...
```

Si ves el query pero no ves logs de éxito en el frontend, el problema es la respuesta del backend.

### Solución 3: Forzar Actualización del Estado

Si sospechas que el estado de Redux no se actualiza, prueba agregar esto temporalmente en `LoginPage.tsx`:

```javascript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const result = await dispatch(login({ email, password }));

  if (login.fulfilled.match(result)) {
    console.log('✅ Login exitoso');
    console.log('📊 Estado de auth después del login:', store.getState().auth);

    // Esperar un poquito para que el estado se actualice
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 100);
  }
};
```

---

## 📤 Información para Compartir

Si después de seguir estos pasos sigue sin funcionar, comparte:

### 1. Logs de la Consola del Navegador

Copia todos los logs que ves en la consola, desde que cargas la página hasta que intentas login.

### 2. LocalStorage

```javascript
console.log('LocalStorage:', {
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user')
});
```

### 3. Estado de Redux

Si instalaste Redux DevTools, toma captura de:
- Estado de `auth` antes del login
- Action `auth/login/fulfilled`
- Estado de `auth` después del login

### 4. Network Tab

En DevTools → Network:
- Busca la request `POST /api/auth/login`
- Copia la response (JSON con token y user)
- Verifica el Status Code

### 5. Logs del Backend

```bash
docker compose logs backend | grep -A 10 -B 10 "admin@delmar.com"
```

---

## 🎓 Entendiendo el Flujo

Para entender mejor lo que está pasando:

```
1. Usuario carga http://localhost
   ↓
2. App.tsx renderiza <BrowserRouter>
   ↓
3. Ruta "/" → redirige a "/dashboard"
   ↓
4. Ruta "/dashboard" tiene <ProtectedRoute>
   ↓
5. ProtectedRoute lee state.auth.isAuthenticated
   ↓
6. Si false → <Navigate to="/login" />
   ↓
7. LoginPage se muestra
   ↓
8. Usuario ingresa credenciales y hace submit
   ↓
9. dispatch(login({ email, password }))
   ↓
10. authService.login() hace POST a /api/auth/login
   ↓
11. Backend responde con { access_token, user }
   ↓
12. authSlice guarda en localStorage y actualiza state
   ↓
13. state.auth.isAuthenticated = true
   ↓
14. LoginPage detecta éxito y hace navigate('/dashboard')
   ↓
15. ProtectedRoute verifica isAuthenticated
   ↓
16. Si true → renderiza <DashboardPage />
   ↓
17. ✅ Usuario ve el dashboard
```

**El problema está en algún paso entre 12 y 15.**

---

## 🚀 Próximos Pasos

1. **Aplicar los cambios:**
   ```bash
   git pull origin claude/pos-nestjs-clean-011CUoHzD38JRsoMh5XNysQJ
   docker compose up -d --build frontend
   ```

2. **Abrir navegador con DevTools**

3. **Intentar login y MIRAR LOS LOGS**

4. **Compartir los logs** si sigue sin funcionar

Los logs te dirán exactamente dónde está el problema. Una vez que los vea, podré darte una solución precisa.

---

## 🔗 Archivos Modificados

- `frontend/src/pages/LoginPage.tsx` - Logs de login y navegación
- `frontend/src/components/auth/ProtectedRoute.tsx` - Logs de verificación de auth
- `frontend/src/features/auth/authSlice.ts` - Logs de estado y actions

Todos los logs usan emojis para fácil identificación visual:
- 🔄 Carga inicial
- 🎉 Éxito
- ❌ Error
- 🔒 Verificación de auth
- ✅ Permitido
- 👤 Usuario
