# POS Delmar

Sistema de Punto de Venta (POS) moderno desarrollado con NestJS + React + PostgreSQL

## 🚀 Stack Tecnológico

### Backend
- **NestJS** 11.0 - Framework Node.js escalable
- **TypeScript** 5.7 - Tipado estático
- **PostgreSQL** 15 - Base de datos relacional
- **Sequelize** - ORM para Node.js
- **JWT** - Autenticación
- **Swagger** - Documentación API
- **Jest** - Testing (93 tests)

### Frontend
- **React** 18.3 - Librería UI
- **TypeScript** 5.6 - Tipado estático
- **Redux Toolkit** 2.5 - State management
- **React Router** 6 - Navegación
- **Vite** 6.0 - Build tool
- **Tailwind CSS** 3.4 - Estilos
- **shadcn/ui** - Componentes UI
- **Vitest** - Testing (142 tests)

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación
- **Nginx** - Servidor web (frontend)

## 📋 Características

### Módulos Implementados

- **Autenticación** - Login, registro, JWT
- **Usuarios** - CRUD, roles, permisos
- **Productos** - CRUD, búsqueda, control de stock
- **Ventas (POS)** - Punto de venta, checkout, historial
- **Reportes** - Dashboard, gráficos, analytics
- **Configuración** - Sistema de configuración categorizado

### Funcionalidades

- ✅ RBAC (Role-Based Access Control)
- ✅ Autenticación JWT
- ✅ API RESTful documentada (Swagger)
- ✅ Punto de venta en tiempo real
- ✅ Control de inventario
- ✅ Reportes y analytics
- ✅ Multi-usuario con roles
- ✅ Responsive design
- ✅ Tests unitarios (235 tests)
- ✅ Dockerizado completo

## 🚀 Inicio Rápido

### Requisitos

- Docker Engine 20.10+
- Docker Compose v2.0+
- Node.js 20+ (solo para desarrollo)

### Instalación con Docker (Recomendado)

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd pos-delmar

# 2. Construir imágenes
docker compose build

# 3. Iniciar servicios
docker compose up -d

# 4. Acceder
Frontend: http://localhost:80
Backend API: http://localhost:3000/api
API Docs: http://localhost:3000/api/docs
```

### Credenciales por Defecto

- **Email:** admin@delmar.com
- **Password:** admin123

## 📖 Documentación

- [Docker Setup](./DOCKER.md) - Guía completa de Docker
- [Backend README](./backend/README.md) - Documentación backend
- [Frontend README](./frontend/README.md) - Documentación frontend

## 🛠️ Desarrollo Local

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env

# Iniciar PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15

# Modo desarrollo
npm run start:dev

# Tests
npm test
npm run test:cov
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env

# Modo desarrollo
npm run dev

# Tests
npm test
npm run test:ui

# Build
npm run build
```

## 🧪 Testing

```bash
# Backend (93 tests)
cd backend
npm test

# Frontend (142 tests)
cd frontend
npm test

# Total: 235 tests
```

## 📁 Estructura del Proyecto

```
pos-delmar/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Módulo autenticación
│   │   ├── users/          # Módulo usuarios
│   │   ├── products/       # Módulo productos
│   │   ├── sales/          # Módulo ventas (POS)
│   │   ├── reports/        # Módulo reportes
│   │   ├── settings/       # Módulo configuración
│   │   ├── database/       # Modelos y configuración DB
│   │   └── common/         # Guards, decorators, etc.
│   ├── test/               # Tests e2e
│   └── Dockerfile          # Docker backend
│
├── frontend/               # App React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── features/      # Redux slices
│   │   ├── pages/         # Páginas
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   └── store/         # Redux store
│   ├── nginx.conf         # Configuración Nginx
│   └── Dockerfile         # Docker frontend
│
├── docker-compose.yml     # Orquestación Docker
├── .env.docker.example    # Ejemplo variables Docker
├── DOCKER.md             # Documentación Docker
└── README.md             # Este archivo
```

## 🔒 Seguridad

- Passwords hasheados con bcrypt
- JWT tokens con expiración
- RBAC (Role-Based Access Control)
- CORS configurado
- Validación de inputs (DTOs)
- SQL injection protection (ORM)
- XSS protection
- Security headers

## 📊 Base de Datos

### Modelos

- **User** - Usuarios del sistema
- **Role** - Roles (Admin, User)
- **Permission** - Permisos granulares
- **Product** - Productos del inventario
- **SaleNote** - Cabecera de venta
- **SaleNoteDetail** - Detalle de venta
- **Setting** - Configuraciones del sistema

### Seeds

La base de datos se inicializa automáticamente con:
- Roles: Admin y User
- Usuario administrador
- 15 configuraciones del sistema

## 🌐 API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/profile` - Perfil usuario

### Products
- `GET /api/products` - Lista productos
- `POST /api/products` - Crear producto
- `GET /api/products/:id` - Obtener producto
- `PATCH /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Sales
- `GET /api/sales` - Lista ventas
- `POST /api/sales` - Crear venta
- `PATCH /api/sales/:id/checkout` - Checkout

### Reports
- `GET /api/reports/sales/daily` - Reporte diario
- `GET /api/reports/sales/monthly` - Reporte mensual
- `GET /api/reports/sales/yearly` - Reporte anual

### Settings (Admin only)
- `GET /api/settings` - Lista configuraciones
- `POST /api/settings` - Crear configuración
- `GET /api/settings/category/:category` - Por categoría

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Autor

POS Delmar - Sistema de Punto de Venta

## 🙏 Agradecimientos

- NestJS - Framework backend
- React - Librería UI
- shadcn/ui - Componentes UI
- Tailwind CSS - Framework CSS
