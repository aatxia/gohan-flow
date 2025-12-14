import { collection, getDocs, addDoc, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

export const NotificationService = {
  getNotifications: async (userId: string) => {
    try {
      if (!db) {
        console.error('❌ Firestore не ініціалізовано');
        return [];
      }

      if (!userId) return [];

      const q = query(
        collection(db, 'notifications'), 
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ Завантажено ${notifications.length} нотифікацій для користувача ${userId}`);
      return notifications;
    } catch (error) {
      console.error("❌ Помилка при завантаженні нотифікацій:", error);
      return [];
    }
  },

  createNotification: async (
    userId: string, 
    title: string, 
    message: string, 
    type: 'info' | 'success' | 'warning' | 'error' | 'meal' | 'shopping' | 'health' | 'recipe' | 'system' = 'info'
  ) => {
    try {
      if (!db) {
        console.error('❌ Firestore не ініціалізовано');
        return null;
      }

      if (!userId) {
        console.warn("⚠️ Спроба відправити сповіщення без userId");
        return null;
      }

      const docRef = await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        read: false,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      
      console.log(`✅ Сповіщення "${title}" створено для користувача ${userId}`);
      return { id: docRef.id, userId, title, message, type };
    } catch (error) {
      console.error("❌ Помилка створення сповіщення:", error);
      return null;
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      if (!db) {
        console.error('❌ Firestore не ініціалізовано');
        return false;
      }

      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        isRead: true,
        readAt: new Date().toISOString(),
      });

      console.log("✅ Нотифікацію позначено як прочитану:", notificationId);
      return true;
    } catch (error) {
      console.error("❌ Помилка при оновленні нотифікації:", error);
      return false;
    }
  }
};

export const getNotifications = NotificationService.getNotifications;

export const createNotification = async (notificationData: {
  userId: string;
  type: 'shopping' | 'meal' | 'health' | 'recipe' | 'system' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}) => {
  try {
    if (!db) {
      console.error('❌ Firestore не ініціалізовано');
      return null;
    }

    if (!notificationData.userId) {
      console.warn("⚠️ Спроба відправити сповіщення без userId");
      return null;
    }

    const docRef = await addDoc(collection(db, 'notifications'), {
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
        read: false,
        isRead: false,
        createdAt: new Date().toISOString()
    });
    
    console.log(`✅ Сповіщення "${notificationData.title}" створено для користувача ${notificationData.userId}`);
    return { 
      id: docRef.id, 
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("❌ Помилка створення сповіщення:", error);
    return null;
  }
};

export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  try {
    if (!db) {
      console.error('❌ Firestore не ініціалізовано');
      return false;
    }

    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: new Date().toISOString(),
    });

    console.log("✅ Нотифікацію позначено як прочитану:", notificationId);
    return true;
  } catch (error) {
    console.error("❌ Помилка при оновленні нотифікації:", error);
    return false;
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    if (!db) {
      console.error('❌ Firestore не ініціалізовано');
      return false;
    }

    const q = query(
      collection(db, 'notifications'),
      where("userId", "==", userId),
      where("read", "==", false)
    );

    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        read: true,
        readAt: new Date().toISOString(),
      })
    );

    await Promise.all(updatePromises);

    console.log(`✅ Позначено ${updatePromises.length} нотифікацій як прочитані`);
    return true;
  } catch (error) {
    console.error("❌ Помилка при оновленні нотифікацій:", error);
    return false;
  }
};





