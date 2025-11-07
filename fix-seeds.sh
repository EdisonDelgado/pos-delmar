#!/bin/bash

echo "🔧 Script de Verificación y Corrección de Seeds"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar que PostgreSQL esté corriendo
if ! docker compose ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL no está corriendo"
    echo "Iniciando PostgreSQL..."
    docker compose up -d postgres
    sleep 5
fi

echo "📊 1. Verificando usuarios en la base de datos..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose exec -T postgres psql -U postgres -d pos_delmar -c "SELECT id, name, email, \"isActive\" FROM users;" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "❌ Error al consultar usuarios"
    echo "La tabla 'users' podría no existir aún"
    echo ""
    echo "Esperando a que las tablas se creen..."
    sleep 5
fi

echo ""
echo "📊 2. Contando usuarios..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
user_count=$(docker compose exec -T postgres psql -U postgres -d pos_delmar -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n')

if [ "$user_count" = "0" ] || [ -z "$user_count" ]; then
    echo "⚠️  No hay usuarios en la base de datos"
    echo ""
    echo "🔧 3. Aplicando seeds manualmente..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Verificar que el archivo de seed existe en el contenedor
    if docker compose exec -T postgres test -f /docker-entrypoint-initdb.d/01-users-seed.sql; then
        echo "✓ Archivo de seed encontrado"
        echo "Ejecutando seed..."
        docker compose exec -T postgres psql -U postgres -d pos_delmar -f /docker-entrypoint-initdb.d/01-users-seed.sql

        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Seed aplicado exitosamente"
        else
            echo ""
            echo "❌ Error al aplicar seed"
        fi
    else
        echo "❌ Archivo de seed no encontrado en el contenedor"
        echo ""
        echo "Copiando seed al contenedor..."
        docker cp backend/seeds/01-users-seed.sql pos-delmar-postgres:/tmp/

        echo "Ejecutando seed..."
        docker compose exec -T postgres psql -U postgres -d pos_delmar -f /tmp/01-users-seed.sql

        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Seed aplicado exitosamente"
        else
            echo ""
            echo "❌ Error al aplicar seed"
        fi
    fi
else
    echo "✓ Hay $user_count usuario(s) en la base de datos"
fi

echo ""
echo "📊 4. Verificando usuarios después del seed..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose exec -T postgres psql -U postgres -d pos_delmar -c "SELECT id, name, email, \"isActive\" FROM users;"

echo ""
echo "📊 5. Verificando roles asignados..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose exec -T postgres psql -U postgres -d pos_delmar -c "SELECT u.email, r.name as role FROM users u JOIN user_roles ur ON u.id = ur.\"userId\" JOIN roles r ON r.id = ur.\"roleId\";"

echo ""
echo "🧪 6. Probando login con curl..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Esperando 2 segundos para que el backend esté listo..."
sleep 2

response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -H "Origin: http://localhost" \
    -d '{"email":"admin@delmar.com","password":"admin123"}')

http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | grep -v "HTTP_CODE:")

echo "Status Code: $http_code"

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "✅ Login exitoso!"
    echo "Token recibido: $(echo $body | grep -o '"access_token":"[^"]*' | cut -d'"' -f4 | cut -c1-30)..."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ ¡Todo está funcionando correctamente!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Puedes hacer login con:"
    echo "  Email: admin@delmar.com"
    echo "  Password: admin123"
    echo ""
    echo "Abre http://localhost en tu navegador"
else
    echo "❌ Login falló"
    echo "Respuesta: $body"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  Hay un problema"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Posibles causas:"
    echo "1. El hash de la contraseña no coincide"
    echo "2. El backend no está usando bcrypt correctamente"
    echo "3. El usuario no se creó correctamente"
    echo ""
    echo "Ejecuta: docker compose logs backend | tail -50"
    echo "Para ver más detalles del error"
fi
