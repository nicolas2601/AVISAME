export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  REQUESTED = 'requested',
}

export enum RequestType {
  WAITER = 'call_waiter',
  BILL = 'bill',
}

export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  restaurant: string;
  order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category?: MenuCategory;
  category_name: string;
  image?: string;
  image_url?: string;
  is_available: boolean;
  preparation_time?: number;
  order: number;
}

export interface Table {
  id: string;
  restaurant: string;
  restaurant_name: string;
  table_number: string;
  capacity: number;
  is_active: boolean;
  qr_code: string;
  qr_image_url?: string;
  status: TableStatus;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TableSession {
  id: string;
  table: string;
  customer?: string;
  is_active: boolean;
  started_at: string;
  ended_at?: string;
}

export interface TableRequest {
  id: string;
  session: string;
  request_type: RequestType;
  status: RequestStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

// API Response Types

export interface ScanQRResponse {
  restaurant_id: string;
  table_id: string;
}

export interface RegisterCustomerResponse {
  message: string;
  customer_id: string;
  phone_number: string;
  verification_code: string; // Solo en desarrollo
}

export interface VerifyCustomerResponse {
  message: string;
  customer: Customer;
}

export interface RequestWaiterResponse {
  message: string;
  request: TableRequest;
  session_id: string;
}

export interface RequestBillResponse {
  message: string;
  request: TableRequest;
  session_id: string;
}

export interface CancelRequestResponse {
  message: string;
  has_active_session: boolean;
}

export interface ActiveRequestResponse {
  has_active_request: boolean;
  request: TableRequest | null;
}

export interface MenuResponse {
  restaurant_name: string;
  items: MenuItem[];
}

export interface RestaurantListResponse {
  results: Restaurant[];
  count: number;
}

export interface TableListResponse {
  results: Table[];
  count: number;
}

// Request Body Types

export interface RegisterCustomerRequest {
  full_name: string;
  phone_number: string;
}

export interface VerifyCustomerRequest {
  phone_number: string;
  verification_code: string;
}

export interface RequestWaiterRequest {
  customer_id: string;
}

export interface RequestBillRequest {
  customer_id: string;
}

export interface CancelRequestRequest {
  customer_id: string;
}

// App State Types

export interface AppState {
  restaurant: Restaurant | null;
  table: Table | null;
  customer: Customer | null;
  session: TableSession | null;
  activeRequest: TableRequest | null;
  menu: MenuItem[];
  loading: boolean;
  error: string | null;
}

export interface QRData {
  restaurant_id: string;
  table_id: string;
}

// Error Response

export interface ErrorResponse {
  error?: string;
  detail?: string;
  [key: string]: any;
}
