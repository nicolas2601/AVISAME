import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea precio colombiano
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(numPrice);
}

// Formatea teléfono colombiano
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

// Valida formato de teléfono colombiano
export function isValidColombianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^3\d{9}$/.test(cleaned);
}

// Extrae restaurant_id y table_id del QR code
export function parseQRCode(qrCode: string): { restaurantId: string; tableId: string } | null {
  const parts = qrCode.split(':');
  if (parts.length === 2) {
    return {
      restaurantId: parts[0],
      tableId: parts[1],
    };
  }
  return null;
}
