'use client';

import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { customerApi } from '@/lib/api';
import { storage } from '@/lib/storage';
import { formatPhone } from '@/lib/utils';
import { toast } from 'sonner';

export default function VerifyPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedPhone = storage.getPhone();
    if (!savedPhone) {
      router.push('/register');
      return;
    }
    setPhoneNumber(savedPhone);
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      const response = await customerApi.verify({
        phone_number: phoneNumber,
        verification_code: code,
      });

      storage.saveCustomer(response.data.customer);
      storage.removePhone();

      toast.success('¡Teléfono verificado exitosamente!');
      router.push('/scan');
    } catch (apiError) {
      console.error('Error en verificación:', apiError);
      const errorResponse = apiError as { response?: { data?: { error?: string } } };
      const message = errorResponse.response?.data?.error ?? 'Código inválido o expirado';
      setError(message);
      toast.error('Error al verificar código');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    toast.info('Función de reenvío próximamente');
  };

  if (!phoneNumber) {
    return null;
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/register')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Verificación</CardTitle>
            <CardDescription>
              Ingresa el código de 6 dígitos enviado a <br />
              <span className="font-semibold">{formatPhone(phoneNumber)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setCode(event.target.value.replace(/\D/g, ''))
                  }
                  maxLength={6}
                  disabled={loading}
                  required
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar código'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResendCode}
                disabled={loading}
              >
                Reenviar código
              </Button>
            </form>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription className="text-center text-sm">
            🔧 <strong>Modo desarrollo:</strong> El código fue enviado en la respuesta del registro.
            Revisa la consola del navegador.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
