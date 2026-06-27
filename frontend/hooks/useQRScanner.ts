import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';

interface QRScannerHook {
  data: string | null;
  error: string | null;
  isScanning: boolean;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  reset: () => void;
}

export function useQRScanner(): QRScannerHook {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);

  const stopScanning = useCallback(() => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (resetError) {
        console.warn('Error stopping QR scanner:', resetError);
      }
    }
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    if (!videoRef.current) {
      setError('No se encontró el elemento de video para escanear');
      return;
    }

    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserQRCodeReader();
    }

    try {
      setIsScanning(true);
      setError(null);

      const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();

      if (!videoInputDevices || videoInputDevices.length === 0) {
        throw new Error('No se encontró ninguna cámara disponible');
      }

      const selectedDeviceId = videoInputDevices[0].deviceId;

      await codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            setData(result.getText());
            stopScanning();
          }

          if (err && !isRecoverableError(err)) {
            console.error('QR Scan error:', err);
            setError('Ocurrió un error al escanear el código QR');
            stopScanning();
          }
        }
      );
    } catch (scanError) {
      console.error('No se pudo iniciar el escaneo QR:', scanError);
      setError(scanError instanceof Error ? scanError.message : 'Error desconocido al iniciar el escaneo');
      stopScanning();
    }
  }, [stopScanning]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  useEffect(() => {
    codeReaderRef.current = new BrowserQRCodeReader();

    return () => {
      stopScanning();
      codeReaderRef.current = null;
    };
  }, [stopScanning]);

  return {
    data,
    error,
    isScanning,
    videoRef,
    startScanning,
    stopScanning,
    reset,
  };
}

function isRecoverableError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      RECOVERABLE_ERROR_NAMES.has(error.name) ||
      (typeof error.message === 'string' && includesRecoverableName(error.message))
    );
  }

  if (typeof error === 'string') {
    return includesRecoverableName(error);
  }

  return false;
}

const RECOVERABLE_ERROR_NAMES = new Set([
  'NotFoundException',
  'FormatException',
  'ChecksumException',
]);

function includesRecoverableName(message: string): boolean {
  return Array.from(RECOVERABLE_ERROR_NAMES).some((name) => message.indexOf(name) >= 0);
}
