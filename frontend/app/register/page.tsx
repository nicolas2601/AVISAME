'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import { customerApi } from '@/lib/api';
import { storage } from '@/lib/storage';
import { isValidColombianPhone } from '@/lib/utils';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Por favor ingresa tu nombre completo');
      return;
    }

    if (!isValidColombianPhone(phoneNumber)) {
      setError('Por favor ingresa un número de celular válido (10 dígitos, debe empezar con 3)');
      return;
    }

    setLoading(true);

    try {
      await customerApi.register({
        full_name: fullName.trim(),
        phone_number: phoneNumber,
      });

      storage.savePhone(phoneNumber);
      toast.success('Código enviado a tu teléfono');
      router.push('/verify');
    } catch (errorResponse: unknown) {
      console.error('Error en registro:', errorResponse);
      const apiError = errorResponse as { response?: { data?: { error?: string } } };
      const message = apiError.response?.data?.error ?? 'Error al registrar. Intenta nuevamente.';
      setError(message);
      toast.error('Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>Ingresa tus datos para comenzar a usar la app</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setFullName(event.target.value)
                  }
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Número de celular</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="3001234567"
                  value={phoneNumber}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setPhoneNumber(event.target.value.replace(/\D/g, ''))
                  }
                  maxLength={10}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">Enviaremos un código de verificación a este número</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  'Enviar código'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
