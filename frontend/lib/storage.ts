import { Customer } from '../types';

const CUSTOMER_KEY = 'customer';
const CUSTOMER_ID_KEY = 'customer_id';
const TABLE_ID_KEY = 'current_table_id';
const RESTAURANT_ID_KEY = 'current_restaurant_id';
const RESTAURANT_NAME_KEY = 'current_restaurant_name';
const PHONE_KEY = 'phone_number';

export const storage = {
  // Customer
  saveCustomer: (customer: Customer) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    localStorage.setItem(CUSTOMER_ID_KEY, customer.id);
  },
  
  getCustomer: (): Customer | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(CUSTOMER_KEY);
    return data ? JSON.parse(data) : null;
  },
  
  getCustomerId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(CUSTOMER_ID_KEY);
  },
  
  removeCustomer: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CUSTOMER_KEY);
    localStorage.removeItem(CUSTOMER_ID_KEY);
  },
  
  isCustomerRegistered: (): boolean => {
    if (typeof window === 'undefined') return false;
    const customer = storage.getCustomer();
    return customer !== null && customer.phone_verified;
  },
  
  // Table
  saveTableId: (tableId: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TABLE_ID_KEY, tableId);
  },
  
  getTableId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TABLE_ID_KEY);
  },
  
  removeTableId: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TABLE_ID_KEY);
  },
  
  // Restaurant
  saveRestaurantId: (restaurantId: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(RESTAURANT_ID_KEY, restaurantId);
  },

  getRestaurantId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(RESTAURANT_ID_KEY);
  },

  removeRestaurantId: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(RESTAURANT_ID_KEY);
    localStorage.removeItem(RESTAURANT_NAME_KEY);
  },

  saveRestaurantName: (name: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(RESTAURANT_NAME_KEY, name);
  },

  getRestaurantName: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(RESTAURANT_NAME_KEY);
  },

  // Phone (for verification flow)
  savePhone: (phone: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PHONE_KEY, phone);
  },
  
  getPhone: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(PHONE_KEY);
  },
  
  removePhone: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PHONE_KEY);
  },
  
  // Clear all
  clearAll: () => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};

export default storage;