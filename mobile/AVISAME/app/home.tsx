import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '../lib/storage';
import { tableApi, restaurantApi } from '../lib/api';
import { MenuItem } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [tableId, setTableId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [activeRequest, setActiveRequest] = useState<{ type: string; status: string } | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [cust, tId, tNum, rName, rId] = await Promise.all([
        storage.getCustomer(),
        storage.getTableId(),
        storage.getTableNumber(),
        storage.getRestaurantName(),
        storage.getRestaurantId(),
      ]);

      if (!cust || !tId || !rId) {
        router.replace('/scan');
        return;
      }

      setCustomerId(cust.id);
      setTableId(tId);
      setTableNumber(tNum || '');
      setRestaurantName(rName || 'Restaurante');

      // Load active request
      const requestRes = await tableApi.getActiveRequest(tId, cust.id);
      if (requestRes.data.active_request) {
        setActiveRequest({
          type: requestRes.data.active_request.type,
          status: requestRes.data.active_request.status,
        });
      } else {
        setActiveRequest(null);
      }

      // Load menu
      const menuRes = await restaurantApi.getMenu(rId);
      setMenu(menuRes.data.items || []);

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudo cargar la información');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleRequestWaiter = async () => {
    if (!tableId || !customerId) return;
    try {
      await tableApi.requestWaiter(tableId, customerId);
      setActiveRequest({ type: 'waiter', status: 'pending' });
      Alert.alert('Éxito', 'El mesero ha sido notificado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo solicitar el mesero');
    }
  };

  const handleRequestBill = async () => {
    if (!tableId || !customerId) return;
    try {
      await tableApi.requestBill(tableId, customerId);
      setActiveRequest({ type: 'bill', status: 'pending' });
      Alert.alert('Éxito', 'La cuenta ha sido solicitada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo solicitar la cuenta');
    }
  };

  const handleCancelRequest = async () => {
    if (!tableId || !customerId) return;
    try {
      await tableApi.cancelRequest(tableId, customerId);
      setActiveRequest(null);
      Alert.alert('Cancelado', 'La solicitud ha sido cancelada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cancelar la solicitud');
    }
  };

  const handleExit = async () => {
    Alert.alert(
      'Salir',
      '¿Estás seguro que quieres salir de la mesa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await storage.removeTableId();
            await storage.removeTableNumber();
            await storage.removeRestaurantId();
            router.replace('/scan');
          },
        },
      ]
    );
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <View>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          <View style={styles.tableBadge}>
            <Text style={styles.tableText}>Mesa {tableNumber}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Ionicons name="log-out-outline" size={24} color="#B00020" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeRequest && (
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Ionicons
                name={activeRequest.type === 'waiter' ? 'person' : 'receipt'}
                size={24}
                color="#0d47a1"
              />
              <Text style={styles.statusTitle}>
                {activeRequest.type === 'waiter' ? 'Mesero Solicitado' : 'Cuenta Solicitada'}
              </Text>
            </View>
            <Text style={styles.statusText}>
              Estado: {activeRequest.status === 'pending' ? 'Pendiente' : 'En proceso'}
            </Text>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRequest}>
              <Text style={styles.cancelButtonText}>Cancelar Solicitud</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, styles.waiterButton, activeRequest && styles.disabledButton]}
            onPress={handleRequestWaiter}
            disabled={!!activeRequest}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={28} color="#0a7ea4" />
            </View>
            <Text style={styles.actionButtonText}>Pedir Mesero</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.billButton, activeRequest && styles.disabledButton]}
            onPress={handleRequestBill}
            disabled={!!activeRequest}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="receipt" size={28} color="#2e7d32" />
            </View>
            <Text style={[styles.actionButtonText, { color: '#2e7d32' }]}>Pedir Cuenta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menú</Text>
          <TouchableOpacity style={styles.viewMenuButton} onPress={() => setShowMenu(true)}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80' }}
              style={styles.menuPreviewImage}
            />
            <View style={styles.menuOverlay}>
              <Text style={styles.viewMenuText}>Ver Carta Completa</Text>
              <Ionicons name="arrow-forward-circle" size={32} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {cart.length > 0 && (
          <View style={styles.cartPreview}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Tu Pedido</Text>
              <Text style={styles.cartCount}>{cartItemCount} items</Text>
            </View>
            <View style={styles.cartTotal}>
              <Text style={styles.totalLabel}>Total estimado</Text>
              <Text style={styles.totalAmount}>${cartTotal.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.viewCartButton} onPress={() => setShowCart(true)}>
              <Text style={styles.viewCartText}>Ver Detalle</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Menú</Text>
            <TouchableOpacity onPress={() => setShowMenu(false)} style={styles.closeButton}>
              <Ionicons name="close-circle" size={30} color="#687076" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.menuList}>
            {menu.map((item) => {
              const inCart = cart.find(i => i.id === item.id);
              return (
                <View key={item.id} style={styles.menuItem}>
                  <Image
                    source={{ uri: item.image_url || item.image || 'https://via.placeholder.com/100' }}
                    style={styles.menuItemImage}
                  />
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemDescription} numberOfLines={2}>{item.description}</Text>
                    <View style={styles.menuItemFooter}>
                      <Text style={styles.menuItemPrice}>${parseFloat(item.price).toLocaleString()}</Text>

                      {inCart ? (
                        <View style={styles.quantityControl}>
                          <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.qtyButton}>
                            <Ionicons name="remove" size={20} color="#0a7ea4" />
                          </TouchableOpacity>
                          <Text style={styles.qtyText}>{inCart.quantity}</Text>
                          <TouchableOpacity onPress={() => addToCart(item)} style={styles.qtyButton}>
                            <Ionicons name="add" size={20} color="#0a7ea4" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity onPress={() => addToCart(item)} style={styles.addButton}>
                          <Text style={styles.addButtonText}>Agregar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {cart.length > 0 && (
            <View style={styles.floatingCartBar}>
              <View>
                <Text style={styles.floatingCartItems}>{cartItemCount} items</Text>
                <Text style={styles.floatingCartTotal}>${cartTotal.toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={styles.floatingCartButton} onPress={() => { setShowMenu(false); setShowCart(true); }}>
                <Text style={styles.floatingCartButtonText}>Ver Pedido</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Cart Modal */}
      <Modal
        visible={showCart}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowCart(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tu Pedido</Text>
            <TouchableOpacity onPress={() => setShowCart(false)} style={styles.closeButton}>
              <Ionicons name="close-circle" size={30} color="#687076" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.cartList}>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>${parseFloat(item.price).toLocaleString()}</Text>
                </View>
                <View style={styles.quantityControl}>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.qtyButton}>
                    <Ionicons name="remove" size={20} color="#0a7ea4" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => addToCart(item)} style={styles.qtyButton}>
                    <Ionicons name="add" size={20} color="#0a7ea4" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.cartFooter}>
            <View style={styles.cartSummaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>${cartTotal.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => {
                Alert.alert('Pedido Enviado', 'Tu pedido ha sido registrado (Simulación)');
                setShowCart(false);
              }}
            >
              <Text style={styles.checkoutButtonText}>Confirmar Pedido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#11181C',
  },
  tableBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  tableText: {
    color: '#0a7ea4',
    fontSize: 12,
    fontWeight: '600',
  },
  exitButton: {
    padding: 8,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  statusCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d47a1',
  },
  statusText: {
    fontSize: 14,
    color: '#1565c0',
    marginBottom: 12,
    marginLeft: 32,
  },
  cancelButton: {
    backgroundColor: '#ef5350',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginLeft: 32,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  waiterButton: {
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  billButton: {
    borderWidth: 1,
    borderColor: '#e8f5e9',
  },
  disabledButton: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#0a7ea4',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 16,
  },
  menuSection: {
    marginBottom: 24,
  },
  viewMenuButton: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  menuPreviewImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  menuOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  viewMenuText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cartPreview: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#11181C',
  },
  cartCount: {
    fontSize: 12,
    color: '#687076',
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#687076',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#11181C',
  },
  viewCartButton: {
    backgroundColor: '#11181C',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#11181C',
  },
  closeButton: {
    padding: 4,
  },
  menuList: {
    padding: 16,
    paddingBottom: 100,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemImage: {
    width: 100,
    height: '100%',
    backgroundColor: '#f1f3f5',
  },
  menuItemContent: {
    flex: 1,
    padding: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#687076',
    marginBottom: 8,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  addButton: {
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#11181C',
    fontSize: 12,
    fontWeight: '600',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 4,
  },
  qtyButton: {
    padding: 4,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
    minWidth: 16,
    textAlign: 'center',
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#11181C',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingCartItems: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  floatingCartTotal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingCartButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#11181C',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#687076',
    marginTop: 2,
  },
  cartFooter: {
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  cartSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#687076',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#11181C',
  },
  checkoutButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
