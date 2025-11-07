#!/bin/bash

echo "🚀 Inicialización de POS Delmar"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# 1. Detener y limpiar contenedores existentes
echo "1️⃣  Limpiando contenedores y volúmenes existentes..."
docker compose down -v 2>/dev/null
print_success "Contenedores y volúmenes eliminados"
echo ""

# 2. Construir imágenes
echo "2️⃣  Construyendo imágenes Docker..."
docker compose build --no-cache
if [ $? -eq 0 ]; then
    print_success "Imágenes construidas exitosamente"
else
    print_error "Error al construir imágenes"
    exit 1
fi
echo ""

# 3. Levantar servicios
echo "3️⃣  Levantando servicios..."
docker compose up -d
if [ $? -eq 0 ]; then
    print_success "Servicios levantados"
else
    print_error "Error al levantar servicios"
    exit 1
fi
echo ""

# 4. Esperar a que PostgreSQL esté listo
echo "4️⃣  Esperando a que PostgreSQL esté listo..."
sleep 10
print_success "PostgreSQL listo"
echo ""

# 5. Verificar que las tablas existen
echo "5️⃣  Verificando tablas de la base de datos..."
TABLES=$(docker compose exec -T postgres psql -U postgres -d pos_delmar -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
if [ "$TABLES" -gt 0 ]; then
    print_success "Tablas creadas ($TABLES tablas)"
else
    print_error "No se encontraron tablas"
    exit 1
fi
echo ""

# 6. Aplicar seeds de usuarios
echo "6️⃣  Aplicando seeds de usuarios y roles..."
docker compose exec -T postgres psql -U postgres -d pos_delmar -f /docker-entrypoint-initdb.d/01-users-seed.sql > /dev/null 2>&1
docker compose exec -T postgres psql -U postgres -d pos_delmar -f /docker-entrypoint-initdb.d/02-verify-roles.sql > /dev/null 2>&1
print_success "Seeds aplicados"
echo ""

# 7. Verificar usuarios
echo "7️⃣  Verificando usuarios creados..."
USERS=$(docker compose exec -T postgres psql -U postgres -d pos_delmar -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
if [ "$USERS" -ge 2 ]; then
    print_success "Usuarios creados ($USERS usuarios)"
else
    print_error "Error: solo se encontraron $USERS usuarios"
fi
echo ""

# 8. Verificar roles asignados
echo "8️⃣  Verificando roles asignados..."
ROLE_ASSIGNMENTS=$(docker compose exec -T postgres psql -U postgres -d pos_delmar -t -c "SELECT COUNT(*) FROM user_roles;" 2>/dev/null | tr -d ' ')
if [ "$ROLE_ASSIGNMENTS" -ge 2 ]; then
    print_success "Roles asignados ($ROLE_ASSIGNMENTS asignaciones)"
else
    print_error "Error: solo se encontraron $ROLE_ASSIGNMENTS asignaciones"
    print_info "Intentando arreglar..."

    # Intentar arreglar roles
    docker compose exec -T postgres psql -U postgres -d pos_delmar << 'EOSQL' > /dev/null 2>&1
DELETE FROM user_roles WHERE user_id IN (1, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1), (2, 2) ON CONFLICT DO NOTHING;
EOSQL

    # Verificar de nuevo
    ROLE_ASSIGNMENTS=$(docker compose exec -T postgres psql -U postgres -d pos_delmar -t -c "SELECT COUNT(*) FROM user_roles;" 2>/dev/null | tr -d ' ')
    if [ "$ROLE_ASSIGNMENTS" -ge 2 ]; then
        print_success "Roles arreglados correctamente"
    else
        print_error "No se pudieron arreglar los roles"
    fi
fi
echo ""

# 9. Probar login
echo "9️⃣  Probando login con credenciales de prueba..."
sleep 2
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delmar.com","password":"admin123"}')

if echo "$RESPONSE" | grep -q "access_token"; then
    ROLES=$(echo "$RESPONSE" | grep -o '"roles":\[[^]]*\]')
    if echo "$ROLES" | grep -q "Admin"; then
        print_success "Login exitoso con roles asignados"
    else
        print_error "Login exitoso pero sin roles asignados"
        echo "   Respuesta: $RESPONSE"
    fi
else
    print_error "Login falló"
    echo "   Respuesta: $RESPONSE"
fi
echo ""

# 10. Resumen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Inicialización completa"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Servicios disponibles:"
echo "   • Frontend:  http://localhost"
echo "   • Backend:   http://localhost:3000/api"
echo "   • API Docs:  http://localhost:3000/api/docs"
echo ""
echo "🔐 Credenciales de prueba:"
echo "   • Admin:"
echo "     - Email:    admin@delmar.com"
echo "     - Password: admin123"
echo ""
echo "   • Usuario:"
echo "     - Email:    user@delmar.com"
echo "     - Password: password123"
echo ""
echo "📝 Comandos útiles:"
echo "   • Ver logs backend:     docker compose logs -f backend"
echo "   • Ver logs frontend:    docker compose logs -f frontend"
echo "   • Ver logs postgres:    docker compose logs -f postgres"
echo "   • Detener servicios:    docker compose down"
echo "   • Reiniciar servicios:  docker compose restart"
echo ""
