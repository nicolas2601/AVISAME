'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { storage } from "@/lib/storage";
import { CreditCard, QrCode, Bell, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    setIsRegistered(storage.isCustomerRegistered());
  }, []);

  const handleStart = () => {
    if (isRegistered) {
      router.push("/scan");
    } else {
      router.push("/register");
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
            <Utensils className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold">AVISAME</h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona tu mesa de forma fácil y rápida
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Escanea el QR
              </CardTitle>
              <CardDescription>
                Cada mesa tiene su propio código QR
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Llama al mesero
              </CardTitle>
              <CardDescription>
                Solicita atención cuando lo necesites
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pide la cuenta
              </CardTitle>
              <CardDescription>
                Solicita tu cuenta de forma rápida
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Button onClick={handleStart} size="lg" className="w-full text-lg">
          {isRegistered ? "Escanear QR" : "Comenzar"}
        </Button>

        {isRegistered && (
          <p className="text-center text-sm text-muted-foreground">
            Ya estás registrado. Escanea el QR de tu mesa.
          </p>
        )}
      </div>
    </div>
  );
}
