import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

export interface ProfileData {
  userId: string;
  name: string;
  email: string;
  age?: number;
  dietaryPreference?: string;
  calorieGoal?: number;
  budgetDaily?: number;
  budgetPeriod?: 'daily' | 'weekly' | 'monthly';
  mealsPerDay?: number;
  allergies?: string[];
}

const PROFILE_FIELDS: (keyof Omit<ProfileData, 'userId'>)[] = [
  'name', 'email', 'age', 'dietaryPreference', 'calorieGoal',
  'budgetDaily', 'budgetPeriod', 'mealsPerDay', 'allergies',
];

export const getProfile = async (userId: string) => {
  try {
    if (!db) return null;

    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return null;

    return snap.data() as Record<string, unknown>;
  } catch (error) {
    console.error('Failed to load profile:', error);
    return null;
  }
};

export const saveProfile = async (profileData: ProfileData) => {
  try {
    if (!db) return null;

    const { userId, ...rest } = profileData;
    if (!userId) throw new Error('User ID is required');

    const dataToSave: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    for (const key of PROFILE_FIELDS) {
      if (rest[key] !== undefined) {
        dataToSave[key] = rest[key];
      }
    }

    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      await updateDoc(userRef, dataToSave);
    } else {
      dataToSave.createdAt = new Date().toISOString();
      await setDoc(userRef, dataToSave);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to save profile:', error);
    return null;
  }
};
