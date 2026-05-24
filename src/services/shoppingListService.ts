import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

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

const userDocRef = (userId: string) => doc(db!, 'users', userId);

export const getShoppingList = async (userId: string): Promise<StoredShoppingList | null> => {
  try {
    if (!db || !userId) return null;

    const snapshot = await getDoc(userDocRef(userId));
    if (!snapshot.exists()) return null;

    const shoppingList = snapshot.data().shoppingList as StoredShoppingList | undefined;
    if (!shoppingList?.items) return null;

    return {
      id: userId,
      userId,
      items: shoppingList.items,
      totalBudget: shoppingList.totalBudget,
      createdAt: shoppingList.createdAt,
      updatedAt: shoppingList.updatedAt,
    };
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
  if (!db) {
    throw new Error('Firestore не ініціалізовано');
  }

  const userId = listData.userId;
  if (!userId) {
    throw new Error('userId обовʼязковий');
  }

  const userRef = userDocRef(userId);
  const existing = await getDoc(userRef);
  const now = new Date().toISOString();
  const previousList = existing.data()?.shoppingList as StoredShoppingList | undefined;

  const shoppingList = {
    items: listData.items,
    totalBudget: listData.totalBudget,
    updatedAt: now,
    createdAt: previousList?.createdAt || now,
  };

  if (existing.exists()) {
    await updateDoc(userRef, { shoppingList });
  } else {
    await setDoc(userRef, { shoppingList }, { merge: true });
  }

  return { id: userId, userId, ...shoppingList };
};
