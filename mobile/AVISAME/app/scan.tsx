import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { storage } from '../lib/storage';
import { tableApi } from '../lib/api';

export default function ScanScreen() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(true);

  useEffect(() => {
    const checkCustomer = async () => {
      const customer = await storage.getCustomer();
      if (!customer || !customer.phone_verified) {
        router.replace('/register');
        return;
      }
    };

    checkCustomer();
  }, [router]);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);
    setQrCode(data);
    // Do not hide scanner, just show processing state
    // setShowScanner(false);

    // Procesar el QR escaneado
    processQRCode(data);
  };

  const processQRCode = async (qrData: string) => {
    setError('');

    if (!qrData.trim()) {
      setError('No se pudo leer el código QR');
      setScanned(false);
      return;
    }

    try {
      const customer = await storage.getCustomer();
      if (!customer) {
        router.replace('/register');
        return;
      }

      const response = await tableApi.scanQr(qrData, customer.id);
      const { restaurant, table } = response.data;

      await storage.saveTableId(table.id);
      await storage.saveTableNumber(table.table_number);
      await storage.saveRestaurantId(restaurant.id);
      await storage.saveRestaurantName(restaurant.name);

      router.replace('/home');
    } catch (e: any) {
      console.error('Error scanning QR:', e);
      const message = e?.response?.data?.error ?? 'Código QR inválido o no encontrado';
      setError(message);
      setScanned(false);
      // Only switch to manual if there is a persistent error or user chooses to
    }
  };

  const handleManualInput = () => {
    processQRCode(qrCode);
  };

  const toggleScanner = () => {
    setShowScanner(!showScanner);
    setScanned(false);
    setError('');
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Se necesita acceso a la cámara para escanear códigos QR</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Otorgar Permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleButton} onPress={() => Linking.openSettings()}>
          <Text style={styles.toggleButtonText}>Abrir Configuración</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escanear QR de la Mesa</Text>

      {showScanner ? (
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.scanner}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanText}>
                {scanned ? 'Procesando...' : 'Apunta la cámara al código QR'}
              </Text>
            </View>
          </CameraView>
        </View>
      ) : (
        <View style={styles.manualContainer}>
          <Text style={styles.subtitle}>
            Ingresa manualmente el código QR o escanea nuevamente
          </Text>

          <TextInput
            style={styles.input}
            placeholder="restaurant-id:table-id"
            value={qrCode}
            onChangeText={setQrCode}
            autoCapitalize="none"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleManualInput}>
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.toggleButton} onPress={toggleScanner}>
        <Text style={styles.toggleButtonText}>
          {showScanner ? 'Ingresar manualmente' : 'Escanear con cámara'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#11181C',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#687076',
  },
  scannerContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#0a7ea4',
    borderRadius: 12,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  scanText: {
    position: 'absolute',
    bottom: 50,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  manualContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    marginTop: 12,
    fontSize: 14,
    color: '#B00020',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#687076',
    marginBottom: 24,
  },
});