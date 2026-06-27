'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import { restaurantApi } from '@/lib/api';
import { storage } from '@/lib/storage';
import { MenuItem as MenuItemType } from '@/types';
import { MenuItem } from '@/components/MenuItem';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function MenuPage() {
  const router = useRouter();
  const params = useParams();
  const tableId = params.tableId as string;

  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const restaurantId = storage.getRestaurantId();

      if (!restaurantId) {
        toast.error('No se encontró información del restaurante');
        router.push(`/table/${tableId}`);
        return;
      }

      const response = await restaurantApi.getMenu(restaurantId);
      setMenuItems(response.data.items);
      setRestaurantName(response.data.restaurant_name);
    } catch (err) {
      console.error('Error al cargar menú:', err);
      toast.error('Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/table/${tableId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto min-h-screen p-4">
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen p-4">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a la mesa
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Menú</h1>
        <p className="text-muted-foreground">{restaurantName}</p>
      </div>

      {menuItems.length === 0 ? (
        <Alert>
          <AlertDescription>
            No hay items disponibles en el menú en este momento.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {menuItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
