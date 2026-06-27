'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Bell, CreditCard, Menu as MenuIcon, X } from 'lucide-react';
import { tableApi } from '@/lib/api';
import { storage } from '@/lib/storage';
import { Table, ActiveRequestResponse, TableStatus } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { ActionButton } from '@/components/ActionButton';
import { LoadingScreen } from '@/components/LoadingSpinner';
import { toast } from 'sonner';

export default function TablePage() {
  const router = useRouter();
  const params = useParams();
  const tableId = params.tableId as string;

  const [table, setTable] = useState<Table | null>(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const customer = storage.getCustomer();
    if (!customer || !customer.phone_verified) {
      router.push('/register');
      return;
    }
    setCustomerId(customer.id);

    const storedName = storage.getRestaurantName();
    if (storedName) {
      setRestaurantName(storedName);
    }

    loadTableData();

    const interval = setInterval(loadTableData, 5000);

    return () => clearInterval(interval);
  }, [tableId, router]);

  const loadTableData = async () => {
    try {
      const storedRestaurantId = storage.getRestaurantId();
      if (!storedRestaurantId) {
        toast.error('No se encontró la información del restaurante. Escanea nuevamente.');
        router.push('/scan');
        return;
      }

      const customerIdentifier = storage.getCustomerId();
      if (!customerIdentifier) {
        toast.error('Sesión vencida, vuelve a registrarte.');
        router.push('/register');
        return;
      }

      const [tableResponse, requestResponse] = await Promise.all([
        tableApi.getTable(tableId),
        tableApi.getActiveRequest(tableId, customerIdentifier),
      ]);

      setTable(tableResponse.data);

      const storedName = storage.getRestaurantName();
      if (storedName) {
        setRestaurantName(storedName);
      } else if (tableResponse.data.restaurant_name) {
        setRestaurantName(tableResponse.data.restaurant_name);
        storage.saveRestaurantName(tableResponse.data.restaurant_name);
      }

      const activeReq = requestResponse.data as ActiveRequestResponse;
      setHasActiveRequest(activeReq.has_active_request);
    } catch (err) {
      console.error('Error al cargar mesa:', err);
      toast.error('Error al cargar información de la mesa');
      if (!table) {
        router.push('/scan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWaiter = async () => {
    if (!customerId) return;

    setActionLoading('waiter');
    try {
      await tableApi.requestWaiter(tableId, customerId);
      toast.success('Mesero solicitado exitosamente');
      await loadTableData();
    } catch (err: any) {
      console.error('Error al solicitar mesero:', err);
      toast.error(err.response?.data?.message || 'Error al solicitar mesero');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestBill = async () => {
    if (!customerId) return;

    setActionLoading('bill');
    try {
      await tableApi.requestBill(tableId, customerId);
      toast.success('Cuenta solicitada exitosamente');
      await loadTableData();
    } catch (err: any) {
      console.error('Error al solicitar cuenta:', err);
      toast.error(err.response?.data?.message || 'Error al solicitar cuenta');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelRequest = async () => {
    if (!customerId) return;

    setActionLoading('cancel');
    try {
      await tableApi.cancelRequest(tableId, customerId);
      toast.success('Solicitud cancelada');
      await loadTableData();
    } catch (err: any) {
      console.error('Error al cancelar solicitud:', err);
      toast.error(err.response?.data?.error || 'Error al cancelar solicitud');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewMenu = () => {
    router.push(`/table/${tableId}/menu`);
  };

  const handleExit = () => {
    storage.removeTableId();
    storage.removeRestaurantId();
    router.push('/');
  };

  if (loading) {
    return <LoadingScreen text="Cargando mesa..." />;
  }

  if (!table) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertDescription>Mesa no encontrada</AlertDescription>
        </Alert>
      </div>
    );
  }

  const normalizedStatus = table.status ?? TableStatus.AVAILABLE;
  const canRequestWaiter = !hasActiveRequest && normalizedStatus !== TableStatus.REQUESTED;
  const canRequestBill = !hasActiveRequest && normalizedStatus !== TableStatus.REQUESTED;
  const canCancel = hasActiveRequest;

  return (
    <div className="container mx-auto min-h-screen p-4">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleExit} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Salir
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Mesa {table.table_number}</CardTitle>
              <p className="text-sm text-muted-foreground">{restaurantName}</p>
            </div>
            <StatusBadge status={table.status} />
          </div>
        </CardHeader>
      </Card>

      {hasActiveRequest && (
        <Alert className="mb-6">
          <AlertDescription className="text-center">
            ⏳ Tu solicitud está siendo procesada...
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <ActionButton
          icon={Bell}
          label="Llamar Mesero"
          onClick={handleRequestWaiter}
          disabled={!canRequestWaiter}
          loading={actionLoading === 'waiter'}
          variant="default"
        />

        <ActionButton
          icon={CreditCard}
          label="Pedir Cuenta"
          onClick={handleRequestBill}
          disabled={!canRequestBill}
          loading={actionLoading === 'bill'}
          variant="default"
        />

        <ActionButton
          icon={MenuIcon}
          label="Ver Menú"
          onClick={handleViewMenu}
          disabled={false}
          loading={false}
          variant="outline"
        />

        <ActionButton
          icon={X}
          label="Cancelar"
          onClick={handleCancelRequest}
          disabled={!canCancel}
          loading={actionLoading === 'cancel'}
          variant="destructive"
        />
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Los cambios de estado se actualizan automáticamente</p>
      </div>
    </div>
  );
}
