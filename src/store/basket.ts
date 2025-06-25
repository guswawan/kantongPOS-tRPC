import { create } from "zustand";

type BasketItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

type AddToBasketItem = Omit<BasketItem, "quantity">;

interface BasketState {
  items: BasketItem[];
  addToBasket: (newItem: AddToBasketItem) => void;
}

export const useBasketStore = create<BasketState>()((set) => ({
  items: [],
  addToBasket: (newItem) => {
    set((currentState) => {
      const duplicateItems = [...currentState.items];

      const existingItemIndex = duplicateItems.findIndex(
        (item) => item.productId === newItem.productId,
      );

      if (existingItemIndex === -1) {
        duplicateItems.push({
          productId: newItem.productId,
          name: newItem.name,
          price: newItem.price,
          imageUrl: newItem.imageUrl,
          quantity: 1,
        });
      } else {
        const itemToUpdate = duplicateItems[existingItemIndex];

        if (!itemToUpdate)
          return {
            ...currentState,
          };

        itemToUpdate.quantity += 1;
      }

      return {
        ...currentState,
        items: duplicateItems,
      };
    });
  },
}));
