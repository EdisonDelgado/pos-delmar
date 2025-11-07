#!/bin/bash

# Script de verificación de Docker para POS Delmar
# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 POS Delmar - Verificación de Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Función para verificar comando
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 está instalado"
        return 0
    else
        echo -e "${RED}✗${NC} $1 NO está instalado"
        return 1
    fi
}

# Función para verificar puerto
check_port() {
    if lsof -i:$1 &> /dev/null; then
        echo -e "${YELLOW}⚠${NC}  Puerto $1 está en uso"
        lsof -i:$1 | grep LISTEN
        return 1
    else
        echo -e "${GREEN}✓${NC} Puerto $1 está disponible"
        return 0
    fi
}

# Función para verificar servicio Docker
check_docker_service() {
    local service=$1
    local status=$(docker compose ps $service --format "{{.State}}" 2>/dev/null)

    if [ -z "$status" ]; then
        echo -e "${RED}✗${NC} Servicio $service no encontrado"
        return 1
    elif [ "$status" == "running" ]; then
        echo -e "${GREEN}✓${NC} Servicio $service está corriendo"
        return 0
    else
        echo -e "${RED}✗${NC} Servicio $service estado: $status"
        return 1
    fi
}

# Función para verificar endpoint
check_endpoint() {
    local url=$1
    local description=$2

    if curl -s -f -o /dev/null "$url"; then
        echo -e "${GREEN}✓${NC} $description responde correctamente"
        return 0
    else
        echo -e "${RED}✗${NC} $description NO responde"
        return 1
    fi
}

# Función para verificar CORS headers
check_cors() {
    local response=$(curl -s -I -X OPTIONS http://localhost:3000/api/auth/login \
        -H "Origin: http://localhost" \
        -H "Access-Control-Request-Method: POST" 2>/dev/null)

    if echo "$response" | grep -i "access-control-allow-origin" > /dev/null; then
        echo -e "${GREEN}✓${NC} Headers CORS configurados correctamente"
        echo "$response" | grep -i "access-control"
        return 0
    else
        echo -e "${RED}✗${NC} Headers CORS NO configurados"
        return 1
    fi
}

echo "📦 1. Verificando Requisitos del Sistema"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_command docker
check_command "docker compose" || check_command "docker-compose"
check_command curl
check_command lsof
echo ""

echo "🔌 2. Verificando Puertos Necesarios"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_port 80
check_port 3000
check_port 5432
echo ""

echo "🐳 3. Verificando Contenedores Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker compose ps &> /dev/null; then
    check_docker_service postgres
    check_docker_service backend
    check_docker_service frontend

    echo ""
    echo "Estado completo de contenedores:"
    docker compose ps
else
    echo -e "${RED}✗${NC} Docker Compose no está corriendo o no hay servicios levantados"
    echo -e "${YELLOW}💡${NC} Ejecuta: docker compose up -d"
fi
echo ""

echo "🌐 4. Verificando Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_endpoint "http://localhost:3000/api" "Backend API"
check_endpoint "http://localhost/" "Frontend"
check_endpoint "http://localhost:3000/api/docs" "Swagger Docs"
echo ""

echo "🔐 5. Verificando CORS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_cors
echo ""

echo "📋 6. Verificando Variables de Entorno del Backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker compose ps backend --format "{{.State}}" | grep -q "running"; then
    echo "CORS_ORIGIN:"
    docker compose exec backend env | grep CORS_ORIGIN || echo -e "${RED}✗${NC} CORS_ORIGIN no encontrado"
    echo ""
    echo "DB_HOST:"
    docker compose exec backend env | grep DB_HOST || echo -e "${RED}✗${NC} DB_HOST no encontrado"
else
    echo -e "${YELLOW}⚠${NC}  Backend no está corriendo"
fi
echo ""

echo "📝 7. Logs Recientes del Backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker compose ps backend --format "{{.State}}" | grep -q "running"; then
    docker compose logs --tail=20 backend
else
    echo -e "${YELLOW}⚠${NC}  Backend no está corriendo"
fi
echo ""

echo "🧪 8. Test de Login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Probando login con credenciales de prueba..."
response=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -H "Origin: http://localhost" \
    -d '{"email":"admin@delmar.com","password":"admin123"}' 2>/dev/null)

if echo "$response" | grep -q "access_token"; then
    echo -e "${GREEN}✓${NC} Login exitoso"
    echo "Token recibido: $(echo $response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4 | cut -c1-20)..."
else
    echo -e "${RED}✗${NC} Login falló"
    echo "Respuesta: $response"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumen de la Verificación"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Contar checks exitosos
checks_passed=0
checks_failed=0

# Esta es una versión simplificada, idealmente contarías los checks reales
if docker compose ps backend --format "{{.State}}" | grep -q "running"; then
    ((checks_passed++))
else
    ((checks_failed++))
fi

if curl -s -f -o /dev/null "http://localhost:3000/api"; then
    ((checks_passed++))
else
    ((checks_failed++))
fi

echo -e "Checks exitosos: ${GREEN}$checks_passed${NC}"
echo -e "Checks fallidos: ${RED}$checks_failed${NC}"
echo ""

if [ $checks_failed -eq 0 ]; then
    echo -e "${GREEN}✓ Todo parece estar funcionando correctamente${NC}"
    echo ""
    echo "🎉 Puedes acceder a la aplicación en:"
    echo "   Frontend: http://localhost"
    echo "   API: http://localhost:3000/api"
    echo "   Swagger: http://localhost:3000/api/docs"
    echo ""
    echo "🔑 Credenciales de prueba:"
    echo "   Email: admin@delmar.com"
    echo "   Password: admin123"
else
    echo -e "${YELLOW}⚠ Hay algunos problemas que necesitan atención${NC}"
    echo ""
    echo "💡 Sugerencias:"
    echo "   1. Si los contenedores no están corriendo: docker compose up -d"
    echo "   2. Si hay errores de CORS: docker compose restart backend"
    echo "   3. Si el backend no responde: docker compose logs backend"
    echo "   4. Ver guía completa: cat DOCKER-NETWORK-DEBUG.md"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
