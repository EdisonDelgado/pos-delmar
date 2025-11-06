import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateSettingRequest, Setting } from '@/types';

interface SettingFormProps {
  onSubmit: (data: CreateSettingRequest) => void;
  initialData?: Setting;
  isLoading?: boolean;
  categories?: string[];
  defaultCategory?: string;
}

export function SettingForm({ onSubmit, initialData, isLoading, categories = ['General', 'Sistema', 'Recibos'], defaultCategory }: SettingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSettingRequest>({
    defaultValues: initialData
      ? {
          key: initialData.key,
          value: initialData.value,
          name: initialData.name,
          description: initialData.description || '',
          category: initialData.category || defaultCategory || 'General',
        }
      : {
          key: '',
          value: '',
          name: '',
          description: '',
          category: defaultCategory || 'General',
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="key">Clave *</Label>
        <Input
          id="key"
          {...register('key', { required: 'La clave es requerida' })}
          placeholder="NOMBRE_EMPRESA"
          disabled={!!initialData || isLoading}
        />
        {errors.key && (
          <p className="text-sm text-red-500">{errors.key.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          {...register('name', { required: 'El nombre es requerido' })}
          placeholder="Nombre de la Empresa"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Valor *</Label>
        <Input
          id="value"
          {...register('value', { required: 'El valor es requerido' })}
          placeholder="POS Delmar"
          disabled={isLoading}
        />
        {errors.value && (
          <p className="text-sm text-red-500">{errors.value.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <select
          id="category"
          {...register('category')}
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          {...register('description')}
          placeholder="Descripción de la configuración"
          className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
