import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, Package, Users, BarChart3 } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  fetchSalesReport,
  fetchDailySalesReport,
  fetchMonthlySalesReport,
  fetchYearlySalesReport,
  fetchSalesByUser,
  clearError,
} from '@/features/reports/reportsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function ReportsPage() {
  const dispatch = useAppDispatch();
  const { salesReport, dailyReport, monthlyReport, userReport, isLoading, error } = useAppSelector(
    (state) => state.reports
  );

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Load initial reports
    dispatch(fetchSalesReport());
    dispatch(fetchDailySalesReport());
    dispatch(fetchMonthlySalesReport({ year: selectedYear }));
    dispatch(fetchSalesByUser());
  }, [dispatch, selectedYear]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleFilterByDate = () => {
    if (startDate && endDate) {
      dispatch(fetchSalesReport({ startDate, endDate }));
      dispatch(fetchDailySalesReport({ startDate, endDate }));
      dispatch(fetchSalesByUser({ startDate, endDate }));
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    dispatch(fetchSalesReport());
    dispatch(fetchDailySalesReport());
    dispatch(fetchSalesByUser());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const getMonthName = (month: number) => {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months[month - 1] || '';
  };

  // Prepare data for charts
  const dailyChartData = dailyReport.map((item) => ({
    date: formatDate(item.date),
    ventas: item.totalSales,
    monto: item.totalAmount,
  }));

  const monthlyChartData = monthlyReport.map((item) => ({
    mes: getMonthName(item.month),
    ventas: item.totalSales,
    monto: item.totalAmount,
  }));

  const topProductsData = salesReport?.topProducts.slice(0, 5).map((item) => ({
    name: item.productName,
    cantidad: item.totalQuantity,
    ingresos: item.totalRevenue,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes y Analytics</h1>
        <p className="text-muted-foreground">Análisis de ventas y rendimiento del negocio</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros de Fecha</CardTitle>
          <CardDescription>Filtra los reportes por rango de fechas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Fecha Inicio</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Fecha Fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleFilterByDate} disabled={!startDate || !endDate || isLoading}>
              <Calendar className="mr-2 h-4 w-4" />
              Aplicar Filtro
            </Button>
            <Button variant="outline" onClick={handleClearFilters} disabled={isLoading}>
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {salesReport && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesReport.totalSales}</div>
              <p className="text-xs text-muted-foreground">Número de transacciones</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(salesReport.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">Monto bruto</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Neto</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(salesReport.netAmount)}</div>
              <p className="text-xs text-muted-foreground">
                IVA: {formatCurrency(salesReport.vatAmount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Venta Promedio</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(salesReport.averageSale)}</div>
              <p className="text-xs text-muted-foreground">Por transacción</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas Diarias</CardTitle>
            <CardDescription>Tendencia de ventas por día</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Cargando datos...</p>
              </div>
            ) : dailyChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ventas" stroke="#8884d8" name="Ventas" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas Mensuales {selectedYear}</CardTitle>
            <CardDescription>Comparativa mensual</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Cargando datos...</p>
              </div>
            ) : monthlyChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ventas" fill="#8884d8" name="Ventas" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products and User Sales */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Productos</CardTitle>
            <CardDescription>Productos más vendidos</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando datos...</p>
              </div>
            ) : topProductsData.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={topProductsData}
                      dataKey="cantidad"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {topProductsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {topProductsData.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{product.cantidad} unidades</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(product.ingresos)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales by User */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Usuario</CardTitle>
            <CardDescription>Rendimiento del equipo</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando datos...</p>
              </div>
            ) : userReport.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-right">Ventas</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userReport.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">{user.userName}</TableCell>
                      <TableCell className="text-right">{user.totalSales}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(user.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
