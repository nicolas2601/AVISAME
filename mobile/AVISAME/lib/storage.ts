import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer } from '@/types';

const CUSTOMER_KEY = 'customer';
const PHONE_KEY = 'phone_number';

export const storage = {
  saveCustomer: async (customer: Customer) => {
    await AsyncStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  },

  getCustomer: async (): Promise<Customer | null> => {
    const data = await AsyncStorage.getItem(CUSTOMER_KEY);
    return data ? (JSON.parse(data) as Customer) : null;
  },

  isCustomerRegistered: async (): Promise<boolean> => {
    const customer = await storage.getCustomer();
    return !!customer && customer.phone_verified;
  },

  removeCustomer: async () => {
    await AsyncStorage.removeItem(CUSTOMER_KEY);
  },

  savePhone: async (phone: string) => {
    await AsyncStorage.setItem(PHONE_KEY, phone);
  },

  getPhone: async (): Promise<string | null> => {
    return AsyncStorage.getItem(PHONE_KEY);
  },

  removePhone: async () => {
    await AsyncStorage.removeItem(PHONE_KEY);
  },

  saveTableId: async (tableId: string) => {
    await AsyncStorage.setItem('table_id', tableId);
  },

  getTableId: async (): Promise<string | null> => {
    return AsyncStorage.getItem('table_id');
  },

  removeTableId: async () => {
    await AsyncStorage.removeItem('table_id');
  },

  saveTableNumber: async (number: string) => {
    await AsyncStorage.setItem('table_number', number);
  },

  getTableNumber: async (): Promise<string | null> => {
    return AsyncStorage.getItem('table_number');
  },

  removeTableNumber: async () => {
    await AsyncStorage.removeItem('table_number');
  },

  saveRestaurantId: async (restaurantId: string) => {
    await AsyncStorage.setItem('restaurant_id', restaurantId);
  },

  getRestaurantId: async (): Promise<string | null> => {
    return AsyncStorage.getItem('restaurant_id');
  },

  removeRestaurantId: async () => {
    await AsyncStorage.removeItem('restaurant_id');
  },

  saveRestaurantName: async (name: string) => {
    await AsyncStorage.setItem('restaurant_name', name);
  },

  getRestaurantName: async (): Promise<string | null> => {
    return AsyncStorage.getItem('restaurant_name');
  },
};
