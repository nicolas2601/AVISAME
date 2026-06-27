import axios from 'axios';
import {
  RegisterCustomerRequest,
  VerifyCustomerRequest,
  RegisterCustomerResponse,
  VerifyCustomerResponse,
  RequestWaiterResponse,
  RequestBillResponse,
  CancelRequestResponse,
  ActiveRequestResponse,
  MenuResponse,
  ErrorResponse,
  Restaurant,
  Table,
  MenuItem,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging (opcional, útil para debug)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Customer API
export const customerApi = {
  register: (data: RegisterCustomerRequest) =>
    api.post<RegisterCustomerResponse>('/customers/register/', data),
  
  verify: (data: VerifyCustomerRequest) =>
    api.post<VerifyCustomerResponse>('/customers/verify/', data),
};

// Table API
export const tableApi = {
  // Escanear QR code
  scanQr: (qrCode: string, customerId?: string) =>
    api.post('/tables/scan-qr/', { 
      qr_code: qrCode, 
      customer_id: customerId 
    }),
  
  // Listar mesas por restaurante
  listByRestaurant: (restaurantId: string) =>
    api.get<{ results: Table[]; count: number }>(`/tables/?restaurant=${restaurantId}`),

  // Obtener una mesa específica
  getTable: (tableId: string) => api.get<Table>(`/tables/${tableId}/`),
  
  // Solicitar mesero
  requestWaiter: (tableId: string, customerId: string) =>
    api.post<RequestWaiterResponse>(`/tables/${tableId}/request-waiter/`, { 
      customer_id: customerId 
    }),
  
  // Solicitar cuenta
  requestBill: (tableId: string, customerId: string) =>
    api.post<RequestBillResponse>(`/tables/${tableId}/request-bill/`, { 
      customer_id: customerId 
    }),
  
  // Cancelar solicitud
  cancelRequest: (tableId: string, customerId: string) =>
    api.post<CancelRequestResponse>(`/tables/${tableId}/cancel-request/`, { 
      customer_id: customerId 
    }),
  
  // Obtener solicitud activa
  getActiveRequest: (tableId: string, customerId?: string) =>
    api.get<ActiveRequestResponse>(`/tables/${tableId}/active-request/`, { 
      params: { customer_id: customerId } 
    }),
};

// Restaurant API
export const restaurantApi = {
  // Listar restaurantes
  list: () =>
    api.get<{ results: Restaurant[]; count: number }>('/restaurants/'),
  
  // Obtener menú del restaurante
  getMenu: (restaurantId: string) =>
    api.get<MenuResponse>(`/restaurants/${restaurantId}/menu/`),
};

// Utilidades para parsear QR codes
export const parseQRCode = (qrCode: string): { restaurantId: string; tableId: string } | null => {
  // El formato del QR es: restaurant_id:table_id
  const parts = qrCode.split(':');
  if (parts.length !== 2) return null;
  
  return {
    restaurantId: parts[0],
    tableId: parts[1],
  };
};

// Función para obtener mesa por QR code
export const getTableByQR = async (qrCode: string): Promise<Table | null> => {
  const qrData = parseQRCode(qrCode);
  if (!qrData) return null;
  
  try {
    // Primero obtenemos las mesas del restaurante
    const response = await tableApi.listByRestaurant(qrData.restaurantId);
    const tables = response.data.results;
    
    // Buscamos la mesa específica
    const table = tables.find(t => t.id === qrData.tableId);
    return table || null;
  } catch (error) {
    console.error('Error getting table by QR:', error);
    return null;
  }
};

// Función para obtener restaurante por QR code
export const getRestaurantByQR = async (qrCode: string): Promise<Restaurant | null> => {
  const qrData = parseQRCode(qrCode);
  if (!qrData) return null;
  
  try {
    const response = await restaurantApi.list();
    const restaurants = response.data.results;
    
    const restaurant = restaurants.find(r => r.id === qrData.restaurantId);
    return restaurant || null;
  } catch (error) {
    console.error('Error getting restaurant by QR:', error);
    return null;
  }
};

// Función completa para escanear QR y obtener datos
export const scanQRCode = async (qrCode: string) => {
  const qrData = parseQRCode(qrCode);
  if (!qrData) {
    throw new Error('Código QR inválido');
  }
  
  try {
    const [restaurant, table] = await Promise.all([
      getRestaurantByQR(qrCode),
      getTableByQR(qrCode),
    ]);
    
    if (!restaurant || !table) {
      throw new Error('Restaurante o mesa no encontrados');
    }
    
    return { restaurant, table };
  } catch (error) {
    console.error('Error scanning QR code:', error);
    throw error;
  }
};

// Tipos de respuesta para las funciones de QR
export interface QRScanResult {
  restaurant: Restaurant;
  table: Table;
}

export default api;
