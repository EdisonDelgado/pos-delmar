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
curl -s http://localhost:3000/api/health | jq . 2>/dev/null || curl -s http://localhost:3000/api/health

# 4. Verificar usuarios
echo ""
echo "👥 Usuarios en la base de datos:"
docker compose exec -T postgres psql -U delmar -d pos_delmar -c "SELECT id, name, email, is_active FROM users;"

# 5. Probar login
echo ""
echo "🔐 Probando login con admin@delmar.com..."
HTTP_CODE=$(curl -s -o /tmp/login-response.json -w "%{http_code}" \
  -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delmar.com","password":"admin123"}')

echo "HTTP Status: $HTTP_CODE"
echo "Respuesta:"
cat /tmp/login-response.json | jq . 2>/dev/null || cat /tmp/login-response.json

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Login exitoso!"
else
  echo "❌ Login falló con código $HTTP_CODE"
fi

# 6. Mostrar logs recientes del backend
echo ""
echo "📜 Últimos 30 logs del backend (buscando logs de autenticación):"
docker compose logs backend | tail -30

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Prueba completa"
echo ""
echo "💡 Para ver logs en tiempo real:"
echo "   docker compose logs -f backend"
echo ""
echo "💡 Para ver logs de autenticación:"
echo "   docker compose logs backend | grep -E '(AuthService|UsersService)'"
