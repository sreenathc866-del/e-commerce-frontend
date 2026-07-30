import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  productId: string;
  name: string;
  vendorName: string;
  image: string;
  price: number;
  discount?: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        if (state.items.find((i) => i.productId === item.productId)) {
          return state;
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (productId) => set((state) => ({ 
        items: state.items.filter((i) => i.productId !== productId) 
      })),
      isInWishlist: (productId) => {
        return !!get().items.find((i) => i.productId === productId);
      }
    }),
    {
      name: 'aura-wishlist-storage',
    }
  )
);
