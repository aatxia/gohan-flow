import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

const SHOPPING_LISTS_COLLECTION = 'shoppingLists';

export interface StoredShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  price: number;
  category: string;
  checked: boolean;
  owned: boolean;
}

export interface StoredShoppingList {
  id: string;
  userId: string;
  items?: StoredShoppingListItem[];
  totalBudget?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getShoppingList = async (userId: string): Promise<StoredShoppingList | null> => {
  try {
    if (!db || !userId) return null;

    const listRef = doc(db, SHOPPING_LISTS_COLLECTION, userId);
    const snapshot = await getDoc(listRef);

    if (!snapshot.exists()) return null;

    return { id: snapshot.id, ...snapshot.data() } as StoredShoppingList;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const saveShoppingList = async (listData: {
  userId: string;
  items: StoredShoppingListItem[];
  totalBudget: number;
}) => {
  try {
    if (!db) {
      throw new Error('Firestore не ініціалізовано');
    }

    const userId = listData.userId;
    if (!userId) {
      throw new Error('userId обовʼязковий');
    }

    const listRef = doc(db, SHOPPING_LISTS_COLLECTION, userId);
    const existing = await getDoc(listRef);
    const now = new Date().toISOString();

    const payload = {
      ...listData,
      updatedAt: now,
      ...(existing.exists() ? {} : { createdAt: now }),
    };

    if (existing.exists()) {
      await updateDoc(listRef, payload);
    } else {
      await setDoc(listRef, payload);
    }

    return { id: userId, ...payload };
  } catch (error) {
    console.error(error);
    return null;
  }
};
