import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/hooks/useAppSelector';
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  const stats = [
    {
      title: 'Productos',
      value: '0',
      description: 'Total de productos en inventario',
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Ventas del Día',
      value: '$0',
      description: 'Ingresos del día actual',
      icon: ShoppingCart,
      color: 'text-green-600',
    },
    {
      title: 'Ventas del Mes',
      value: '$0',
      description: 'Total del mes en curso',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: 'Usuarios Activos',
      value: '1',
      description: 'Usuarios con acceso al sistema',
      icon: Users,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido de nuevo, {user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/products"
              className="block px-4 py-2 rounded-md hover:bg-accent transition-colors"
            >
              Ver Productos
            </a>
            <a
              href="/sales"
              className="block px-4 py-2 rounded-md hover:bg-accent transition-colors"
            >
              Nueva Venta
            </a>
            {user?.roles?.includes('Admin') && (
              <a
                href="/reports"
                className="block px-4 py-2 rounded-md hover:bg-accent transition-colors"
              >
                Ver Reportes
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>
              Información general del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Estado:</span>
              <span className="text-sm font-medium text-green-600">Activo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Versión:</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rol:</span>
              <span className="text-sm font-medium">{user?.roles?.join(', ')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No hay actividad reciente
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
