import axios from 'axios';
import {
  RegisterCustomerRequest,
  RegisterCustomerResponse,
  VerifyCustomerRequest,
  VerifyCustomerResponse,
  Table,
  Restaurant,
  RequestWaiterResponse,
  RequestBillResponse,
  CancelRequestResponse,
  ActiveRequestResponse,
  MenuResponse,
} from '@/types';

const API_URL = 'https://avisame.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

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

export default api;
