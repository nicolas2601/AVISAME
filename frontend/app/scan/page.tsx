'use client';

import { useCallback, useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Camera, Keyboard } from 'lucide-react';
import { useQRScanner } from '@/hooks/useQRScanner';
import { tableApi } from '@/lib/api';
import { storage } from '@/lib/storage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'sonner';

export default function ScanPage() {
  const router = useRouter();
  const { videoRef, data, error, isScanning, startScanning, stopScanning, reset } = useQRScanner();
  const [processing, setProcessing] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    const customer = storage.getCustomer();
    if (!customer || !customer.phone_verified) {
      router.push('/register');
      return;
    }

    setCustomerId(customer.id);
  }, [router]);

  const handleQRDetected = useCallback(
    async (qrCode: string) => {
      if (!customerId) {
        return;
      }

      setProcessing(true);

      try {
        const response = await tableApi.scanQr(qrCode, customerId);
        const { restaurant, table } = response.data;

        storage.saveTableId(table.id);
        storage.saveRestaurantId(restaurant.id);
        storage.saveRestaurantName(restaurant.name);

        toast.success(`Mesa ${table.table_number} - ${restaurant.name}`);

        stopScanning();
        router.push(`/table/${table.id}`);
      } catch (scanError) {
        console.error('Error al procesar QR:', scanError);
        const apiError = scanError as { response?: { data?: { error?: string } } };
        const message = apiError.response?.data?.error ?? 'QR inválido';
        toast.error(message);
        reset();
        setProcessing(false);
      }
    },
    [customerId, reset, router, stopScanning]
  );

  useEffect(() => {
    if (data) {
      handleQRDetected(data);
    }
  }, [data, handleQRDetected]);

  const handleManualSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (manualCode.trim()) {
        setProcessing(true);
        handleQRDetected(manualCode.trim());
      }
    },
    [handleQRDetected, manualCode]
  );

  useEffect(() => {
    if (!showManualInput) {
      setManualCode('');
    }
  }, [showManualInput]);

  const handleManualInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setManualCode(event.target.value);
  };

  if (!customerId) {
    return null;
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col p-4">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowManualInput(true)}
          className="gap-2"
        >
          <Keyboard className="h-4 w-4" />
          Ingresar código
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center space-y-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Escanear QR de la Mesa
            </CardTitle>
            <CardDescription>Apunta la cámara al código QR de tu mesa</CardDescription>
          </CardHeader>
          <CardContent>
            {processing ? (
              <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
                <LoadingSpinner text="Procesando..." />
              </div>
            ) : (
              <>
                <div className="relative aspect-square overflow-hidden rounded-lg bg-black">
                  <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
                  {!isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Button onClick={startScanning} size="lg">
                        Iniciar Cámara
                      </Button>
                    </div>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          El QR se encuentra en la mesa del restaurante
        </p>
      </div>

      <Dialog open={showManualInput} onOpenChange={setShowManualInput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingresar código manualmente</DialogTitle>
            <DialogDescription>Ingresa el código QR si no puedes escanearlo</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manualCode">Código QR</Label>
              <Input
                id="manualCode"
                placeholder="restaurant-id:table-id"
                value={manualCode}
                onChange={handleManualInputChange}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? 'Procesando...' : 'Continuar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
