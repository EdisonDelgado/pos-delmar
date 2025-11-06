import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  fetchSettings,
  fetchSettingsByCategory,
  createSetting,
  updateSetting,
  deleteSetting,
  clearError,
  clearCurrentSetting,
} from '@/features/settings/settingsSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SettingForm } from '@/components/settings/SettingForm';
import type { Setting, CreateSettingRequest } from '@/types';

const CATEGORIES = ['General', 'Sistema', 'Recibos'];

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const { settings, isLoading, error } = useAppSelector((state) => state.settings);

  const [activeTab, setActiveTab] = useState('General');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchSettings());
  };

  const handleTabChange = (category: string) => {
    setActiveTab(category);
  };

  const handleCreateSetting = async (data: CreateSettingRequest) => {
    const result = await dispatch(createSetting(data));
    if (createSetting.fulfilled.match(result)) {
      setIsCreateDialogOpen(false);
      dispatch(fetchSettings());
    }
  };

  const handleEditSetting = async (data: CreateSettingRequest) => {
    if (selectedSetting) {
      const result = await dispatch(
        updateSetting({ id: selectedSetting.id, data })
      );
      if (updateSetting.fulfilled.match(result)) {
        setIsEditDialogOpen(false);
        setSelectedSetting(null);
        dispatch(fetchSettings());
      }
    }
  };

  const handleDeleteSetting = async () => {
    if (selectedSetting) {
      const result = await dispatch(deleteSetting(selectedSetting.id));
      if (deleteSetting.fulfilled.match(result)) {
        setIsDeleteDialogOpen(false);
        setSelectedSetting(null);
        dispatch(fetchSettings());
      }
    }
  };

  const openEditDialog = (setting: Setting) => {
    setSelectedSetting(setting);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (setting: Setting) => {
    setSelectedSetting(setting);
    setIsDeleteDialogOpen(true);
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter((s) => (s.category || 'General') === category);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-slate-500 mt-1">
            Gestiona los parámetros de configuración del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Configuración
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          {CATEGORIES.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((category) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle>Configuración - {category}</CardTitle>
                <CardDescription>
                  Configuraciones de la categoría {category}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-slate-500">
                    Cargando configuraciones...
                  </div>
                ) : getSettingsByCategory(category).length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No hay configuraciones en esta categoría
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clave</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSettingsByCategory(category).map((setting) => (
                        <TableRow key={setting.id}>
                          <TableCell className="font-mono text-sm">
                            {setting.key}
                          </TableCell>
                          <TableCell>{setting.name}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {setting.value}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {setting.description || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openEditDialog(setting)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openDeleteDialog(setting)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Configuración</DialogTitle>
            <DialogDescription>
              Crea una nueva configuración del sistema
            </DialogDescription>
          </DialogHeader>
          <SettingForm
            onSubmit={handleCreateSetting}
            isLoading={isLoading}
            categories={CATEGORIES}
            defaultCategory={activeTab}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Configuración</DialogTitle>
            <DialogDescription>
              Modifica la configuración del sistema
            </DialogDescription>
          </DialogHeader>
          {selectedSetting && (
            <SettingForm
              onSubmit={handleEditSetting}
              initialData={selectedSetting}
              isLoading={isLoading}
              categories={CATEGORIES}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Configuración</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta configuración?
            </DialogDescription>
          </DialogHeader>
          {selectedSetting && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded">
                <p className="text-sm font-medium">{selectedSetting.name}</p>
                <p className="text-sm text-slate-500 font-mono">
                  {selectedSetting.key}
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSetting}
                  disabled={isLoading}
                >
                  {isLoading ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
