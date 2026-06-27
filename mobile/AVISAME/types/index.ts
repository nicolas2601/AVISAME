export interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterCustomerRequest {
  full_name: string;
  phone_number: string;
}

export interface RegisterCustomerResponse {
  message: string;
  customer_id: string;
  phone_number: string;
}

export interface VerifyCustomerRequest {
  phone_number: string;
  verification_code: string;
}

export interface VerifyCustomerResponse {
  message: string;
  customer: Customer;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  logo?: string;
}

export interface Table {
  id: string;
  restaurant: string;
  table_number: string;
  qr_code: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

export interface MenuItem {
  id: string;
  restaurant: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image?: string;
  image_url?: string;
  is_available: boolean;
}

export interface RequestWaiterResponse {
  message: string;
  request_id: string;
}

export interface RequestBillResponse {
  message: string;
  request_id: string;
}

export interface CancelRequestResponse {
  message: string;
}

export interface ActiveRequestResponse {
  active_request: {
    id: string;
    type: 'waiter' | 'bill';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
  } | null;
}

export interface MenuResponse {
  restaurant_name: string;
  items: MenuItem[];
}
