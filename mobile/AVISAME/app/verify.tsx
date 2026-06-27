import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { customerApi } from '@/lib/api';
import { storage } from '@/lib/storage';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPhone = async () => {
      const savedPhone = await storage.getPhone();
      if (!savedPhone) {
        router.replace('/register');
        return;
      }
      setPhoneNumber(savedPhone);
    };

    loadPhone();
  }, [router]);

  const handleSubmit = async () => {
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

      await storage.saveCustomer(response.data.customer);
      await storage.removePhone();

      router.replace('/scan');
    } catch (e: any) {
      const message = e?.response?.data?.error ?? 'Código inválido o expirado';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.replace('/register');
  };

  if (!phoneNumber) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Verificar Teléfono</Text>
          <Text style={styles.subtitle}>
            Ingresa el código de 6 dígitos que enviamos al número{' '}
            <Text style={styles.phoneHighlight}>{phoneNumber}</Text>
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor="#D7DBDF"
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#B00020" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verificar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton}>
          <Text style={styles.resendText}>¿No recibiste el código? Reenviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  textContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#687076',
    lineHeight: 24,
  },
  phoneHighlight: {
    color: '#11181C',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 80,
    borderWidth: 2,
    borderColor: '#E6E8EB',
    borderRadius: 16,
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
    color: '#11181C',
    backgroundColor: '#F8F9FA',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    color: '#B00020',
    fontSize: 14,
    flex: 1,
  },
  button: {
    height: 56,
    backgroundColor: '#0a7ea4',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    color: '#0a7ea4',
    fontSize: 14,
    fontWeight: '600',
  },
});
