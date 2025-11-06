import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, X, Plus, Minus, Trash2, DollarSign, FileText } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  createSaleNote,
  fetchPendingSales,
  checkoutSale,
  deleteSaleNote,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  clearError,
  type CartItem,
} from '@/features/sales/salesSlice';
import { searchProducts } from '@/features/products/productsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Product } from '@/types';

export function SalesPage() {
  const dispatch = useAppDispatch();
  const { cart, cartTotal, pendingSales, isLoading, error } = useAppSelector((state) => state.sales);
  const { products } = useAppSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [document, setDocument] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchPendingSales());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await dispatch(searchProducts({ name: searchTerm, limit: 10 }));
    }
  };

  const handleBarcodeSearch = async (barcode: string) => {
    if (barcode.trim()) {
      await dispatch(searchProducts({ name: barcode, limit: 1 }));
    }
  };

  const handleAddToCart = (product: Product) => {
    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      barcode: product.barcode,
      quantity: 1,
      unitPrice: product.costPrice,
      salePrice: product.salePrice,
      totalPrice: product.salePrice,
    };
    dispatch(addToCart(cartItem));
    setSearchTerm('');
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateCartItemQuantity({ productId, quantity }));
    } else {
      dispatch(removeFromCart(productId));
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    dispatch(removeFromCart(productId));
  };

  const handleCreateSale = async () => {
    if (cart.length === 0) return;

    const saleItems = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.salePrice,
    }));

    const result = await dispatch(createSaleNote({ items: saleItems }));
    if (createSaleNote.fulfilled.match(result)) {
      dispatch(clearCart());
      dispatch(fetchPendingSales());
      alert('Nota de venta creada exitosamente');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // First create the sale
    const saleItems = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.salePrice,
    }));

    const createResult = await dispatch(createSaleNote({ items: saleItems }));
    if (createSaleNote.fulfilled.match(createResult)) {
      const saleId = createResult.payload.id;

      // Then immediately checkout
      const checkoutResult = await dispatch(
        checkoutSale({
          id: saleId,
          data: { comment: comment || undefined, document: document || undefined },
        })
      );

      if (checkoutSale.fulfilled.match(checkoutResult)) {
        dispatch(clearCart());
        dispatch(fetchPendingSales());
        setIsCheckoutDialogOpen(false);
        setComment('');
        setDocument('');
        alert('Venta procesada exitosamente');
      }
    }
  };

  const handleCheckoutPendingSale = async (saleId: number) => {
    const result = await dispatch(
      checkoutSale({
        id: saleId,
        data: {},
      })
    );

    if (checkoutSale.fulfilled.match(result)) {
      dispatch(fetchPendingSales());
      alert('Venta cobrada exitosamente');
    }
  };

  const handleDeleteSale = async (saleId: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
      await dispatch(deleteSaleNote(saleId));
      dispatch(fetchPendingSales());
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Punto de Venta (POS)</h1>
        <p className="text-muted-foreground">Sistema de ventas y gestión de caja</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Product Search and Cart */}
        <div className="space-y-6">
          {/* Barcode Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Escanear Código de Barras</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                ref={barcodeInputRef}
                placeholder="Escanea o ingresa código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleBarcodeSearch(searchTerm);
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Buscar Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Search Results */}
              {products.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Resultados:</p>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 border rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => handleAddToCart(product)}
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.barcode} - Stock: {product.stock}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(product.salePrice)}</p>
                          <Button size="sm" variant="ghost">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card>
            <CardHeader>
              <CardTitle>Carrito de Compras</CardTitle>
              <CardDescription>{cart.length} producto(s) en el carrito</CardDescription>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">El carrito está vacío</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center gap-2 p-2 border rounded-md">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(item.salePrice)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveFromCart(item.productId)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <p className="font-medium w-24 text-right">{formatCurrency(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => dispatch(clearCart())} className="flex-1">
                        <X className="mr-2 h-4 w-4" />
                        Limpiar
                      </Button>
                      <Button onClick={handleCreateSale} disabled={isLoading} className="flex-1">
                        <FileText className="mr-2 h-4 w-4" />
                        Crear Nota
                      </Button>
                      <Button onClick={() => setIsCheckoutDialogOpen(true)} disabled={isLoading} className="flex-1">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Cobrar
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pending Sales */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ventas Pendientes</CardTitle>
              <CardDescription>{pendingSales.length} ventas sin cobrar</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSales.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay ventas pendientes</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {pendingSales.map((sale) => (
                    <div key={sale.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Nota #{sale.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.createdAt).toLocaleString('es-CL')}
                          </p>
                        </div>
                        <p className="text-lg font-bold">{formatCurrency(sale.amount)}</p>
                      </div>

                      {sale.details && (
                        <div className="space-y-1 mb-3">
                          {sale.details.map((detail) => (
                            <div key={detail.id} className="text-sm flex justify-between">
                              <span>
                                {detail.product?.name || `Producto #${detail.productId}`} x{detail.quantity}
                              </span>
                              <span>{formatCurrency(detail.totalPrice)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleCheckoutPendingSale(sale.id)}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Cobrar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSale(sale.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procesar Venta</DialogTitle>
            <DialogDescription>Ingresa detalles adicionales para la venta</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comentario (opcional)</label>
              <Input
                placeholder="Ej: Cliente frecuente, descuento aplicado..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Documento (opcional)</label>
              <Input
                placeholder="Ej: RUT, número de factura..."
                value={document}
                onChange={(e) => setDocument(e.target.value)}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span>Total a Cobrar:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCheckoutDialogOpen(false);
                    setComment('');
                    setDocument('');
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleCheckout} disabled={isLoading} className="flex-1">
                  {isLoading ? 'Procesando...' : 'Confirmar Venta'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
