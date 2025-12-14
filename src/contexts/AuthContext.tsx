import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseReady } from '@/config/firebaseConfig';
import { AuthService } from '@/services/authService';

export interface User { 
  id: string; 
  email: string; 
  name: string; 
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseReady() || !auth) {
      console.warn('Firebase not configured. Authentication disabled.');
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const profile = await AuthService.getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || profile.email || '',
              name: profile.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            });
          } else {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            });
          }
        } catch (error) {
          console.error('Помилка завантаження профілю:', error);
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseReady() || !auth) {
      return { 
        success: false, 
        error: 'Firebase is not configured. Please update src/config/firebaseConfig.ts with your Firebase credentials.' 
      };
    }

    try {
      const { user: firebaseUser, profile } = await AuthService.login(email, password);
      
      if (profile) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || profile.email || '',
          name: profile.name || firebaseUser.displayName || 'User',
        });
      } else {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Помилка входу:', error);
      let errorMessage = 'Invalid email or password';
      
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/user-not-found') {
          errorMessage = 'User not found';
        } else if (firebaseError.code === 'auth/wrong-password') {
          errorMessage = 'Wrong password';
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email format';
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (firebaseError.code === 'auth/invalid-credential') {
          errorMessage = 'Invalid email or password';
        }
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseReady() || !auth) {
      return { 
        success: false, 
        error: 'Firebase is not configured. Please update src/config/firebaseConfig.ts with your Firebase credentials.' 
      };
    }

    try {
      const { user: firebaseUser, profile } = await AuthService.register(email, password, { name });
      
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email || profile.email || '',
        name: profile.name || name,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Помилка реєстрації:', error);
      let errorMessage = 'Failed to create account';
      
      if (error instanceof Error) {
        if ('code' in error) {
          const firebaseError = error as { code: string; message?: string };
          
          switch (firebaseError.code) {
            case 'auth/email-already-in-use':
              errorMessage = 'This email is already registered. Please sign in instead.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Invalid email format. Please enter a valid email address.';
              break;
            case 'auth/weak-password':
              errorMessage = 'Password should be at least 6 characters long.';
              break;
            case 'auth/operation-not-allowed':
              errorMessage = 'Email/password accounts are not enabled. Please contact support.';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Please check your internet connection.';
              break;
            default:
              errorMessage = firebaseError.message || `Registration failed: ${firebaseError.code}`;
          }
        } else {
          errorMessage = error.message || 'Failed to create account. Please try again.';
        }
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    if (!isFirebaseReady() || !auth) {
      setUser(null);
      return;
    }

    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Помилка виходу:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
