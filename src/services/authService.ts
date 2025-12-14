import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebaseConfig";

export interface UserData {
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: 'low' | 'moderate' | 'high';
  goal?: 'lose' | 'gain' | 'maintain';
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  budgetSettings: {
    monthlyLimit: number;
    currentSpent: number;
  };
  healthProfile: {
    age: number;
    weight: number;
    height: number;
    activityLevel: string;
    goal: string;
  };
  savedRecipes: string[];
}

export const AuthService = {
  register: async (email: string, password: string, userData: UserData) => {
    try {
      if (!auth || !db) {
        throw new Error("Firebase не ініціалізовано! Перевірте firebaseConfig.ts");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (userData.name) {
        await updateProfile(user, { displayName: userData.name });
      }

      const userProfile: UserProfile = {
        uid: user.uid,
        email: email,
        name: userData.name,
        role: "user",
        createdAt: new Date().toISOString(),
        budgetSettings: {
          monthlyLimit: 0,
          currentSpent: 0
        },
        healthProfile: {
          age: userData.age || 0,
          weight: userData.weight || 0,
          height: userData.height || 0,
          activityLevel: userData.activityLevel || "moderate",
          goal: userData.goal || "maintain"
        },
        savedRecipes: []
      };

      await setDoc(doc(db, "users", user.uid), userProfile);

      console.log("✅ Користувача зареєстровано та профіль створено в Firestore:", user.uid);
      
      return { user, profile: userProfile };
    } catch (error) {
      console.error("❌ Помилка реєстрації:", error);
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      if (!auth || !db) {
        throw new Error("Firebase не ініціалізовано! Перевірте firebaseConfig.ts");
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        console.log("✅ Дані користувача завантажено з Firestore:", profileData);
        return { user, profile: profileData };
      } else {
        console.warn("⚠️ Профіль не знайдено в БД! Створюємо базовий профіль...");
        
        const basicProfile: UserProfile = {
          uid: user.uid,
          email: user.email || email,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          role: "user",
          createdAt: new Date().toISOString(),
          budgetSettings: {
            monthlyLimit: 0,
            currentSpent: 0
          },
          healthProfile: {
            age: 0,
            weight: 0,
            height: 0,
            activityLevel: "moderate",
            goal: "maintain"
          },
          savedRecipes: []
        };

        await setDoc(doc(db, "users", user.uid), basicProfile);
        console.log("✅ Базовий профіль створено для користувача:", user.uid);
        
        return { user, profile: basicProfile };
      }
    } catch (error) {
      console.error("❌ Помилка входу:", error);
      throw error;
    }
  },

  logout: async () => {
    if (!auth) {
      throw new Error("Firebase не ініціалізовано!");
    }
    await signOut(auth);
    console.log("✅ Користувач вийшов з системи");
  },

  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      if (!db) {
        console.error('❌ Firestore не ініціалізовано');
        return null;
      }

      const userDoc = await getDoc(doc(db, "users", uid));
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Помилка отримання профілю:", error);
      return null;
    }
  }
};
