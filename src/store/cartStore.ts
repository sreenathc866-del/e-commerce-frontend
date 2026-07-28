import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique cart item id
  productId: string;
  name: string;
  vendorName: string;
  image: string;
  price: number;
  discount?: number;
  quantity: number;
  stock: number;
  variant?: string;
  shopId: string;
  shippingCharge: number;
  taxPercentage: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getTotalTax: () => number;
  getTotalShipping: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.productId === item.productId && i.variant === item.variant);
        if (existing) {
          return {
            items: state.items.map((i) => 
              i.id === existing.id 
                ? { ...i, quantity: Math.min(i.stock, i.quantity + item.quantity) } 
                : i
            )
          };
        }
        return { items: [...state.items, { ...item, id: Math.random().toString(36).substr(2, 9) }] };
      }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i))
      })),
      clearCart: () => set({ items: [] }),
      getSubtotal: () => {
        const items = get().items;
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      },
      getDiscount: () => {
        const items = get().items;
        return items.reduce((sum, item) => {
          if (!item.discount) return sum;
          const originalTotal = item.price * item.quantity;
          const discountAmt = originalTotal * (item.discount / 100);
          return sum + discountAmt;
        }, 0);
      },
      getTotal: () => {
        return get().getSubtotal() - get().getDiscount();
      },
      getTotalTax: () => {
        const items = get().items;
        return items.reduce((sum, item) => {
          const itemTotal = item.price * item.quantity;
          const discountAmt = item.discount ? itemTotal * (item.discount / 100) : 0;
          const taxableAmount = itemTotal - discountAmt;
          return sum + (taxableAmount * (item.taxPercentage / 100));
        }, 0);
      },
      getTotalShipping: () => {
        const items = get().items;
        // Group by shopId and take the max shipping charge for each shop
        const shopCharges = new Map<string, number>();
        items.forEach(item => {
          const current = shopCharges.get(item.shopId) || 0;
          if (item.shippingCharge > current) {
            shopCharges.set(item.shopId, item.shippingCharge);
          }
        });
        return Array.from(shopCharges.values()).reduce((sum, charge) => sum + charge, 0);
      }
    }),
    {
      name: 'aura-cart-storage',
    }
  )
);
