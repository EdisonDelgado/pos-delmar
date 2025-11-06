import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product, CreateProductRequest } from '@/types';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: CreateProductRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState<CreateProductRequest>({
    barcode: '',
    name: '',
    stock: 0,
    costPrice: 0,
    salePrice: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateProductRequest, string>>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        barcode: product.barcode,
        name: product.name,
        stock: product.stock,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
      });
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateProductRequest, string>> = {};

    if (!formData.barcode.trim()) {
      newErrors.barcode = 'El código de barras es requerido';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }
    if (formData.costPrice < 0) {
      newErrors.costPrice = 'El precio de costo no puede ser negativo';
    }
    if (formData.salePrice < 0) {
      newErrors.salePrice = 'El precio de venta no puede ser negativo';
    }
    if (formData.salePrice < formData.costPrice) {
      newErrors.salePrice = 'El precio de venta debe ser mayor o igual al precio de costo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CreateProductRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="barcode">Código de Barras *</Label>
        <Input
          id="barcode"
          value={formData.barcode}
          onChange={(e) => handleChange('barcode', e.target.value)}
          placeholder="7501234567890"
          disabled={isLoading}
        />
        {errors.barcode && (
          <p className="text-sm text-destructive">{errors.barcode}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Coca Cola 2L"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="stock">Stock *</Label>
        <Input
          id="stock"
          type="number"
          value={formData.stock}
          onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
          placeholder="100"
          min="0"
          disabled={isLoading}
        />
        {errors.stock && (
          <p className="text-sm text-destructive">{errors.stock}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="costPrice">Precio Costo *</Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            value={formData.costPrice}
            onChange={(e) => handleChange('costPrice', parseFloat(e.target.value) || 0)}
            placeholder="1500"
            min="0"
            disabled={isLoading}
          />
          {errors.costPrice && (
            <p className="text-sm text-destructive">{errors.costPrice}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="salePrice">Precio Venta *</Label>
          <Input
            id="salePrice"
            type="number"
            step="0.01"
            value={formData.salePrice}
            onChange={(e) => handleChange('salePrice', parseFloat(e.target.value) || 0)}
            placeholder="2000"
            min="0"
            disabled={isLoading}
          />
          {errors.salePrice && (
            <p className="text-sm text-destructive">{errors.salePrice}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
