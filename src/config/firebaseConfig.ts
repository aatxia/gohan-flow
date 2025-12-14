import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyADOqNOnF3PpCGxeXYXcTOGY1gaVl9rjEQ",
  authDomain: "meal-plan-1fd39.firebaseapp.com",
  projectId: "meal-plan-1fd39",
  storageBucket: "meal-plan-1fd39.firebasestorage.app",
  messagingSenderId: "1058010268706",
  appId: "1:1058010268706:web:7a55c45482aef14cdc767b",
  measurementId: "G-7BJ30VNGWN"
};

const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY" && 
         firebaseConfig.projectId !== "YOUR_PROJECT_ID";
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: ReturnType<typeof getAnalytics> | null = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    analytics = getAnalytics(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured. Please update src/config/firebaseConfig.ts with your Firebase credentials.');
}

export { auth, db };
export const isFirebaseReady = () => isFirebaseConfigured() && app !== null;
export default app;

