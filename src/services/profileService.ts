const API_URL = 'http://localhost:5000/api/users';

export const getProfile = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    if (!response.ok) {
      throw new Error('Помилка при завантаженні профілю');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

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

export const saveProfile = async (profileData: ProfileData) => {
  try {
    const { userId, ...userData } = profileData;
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Profile save error:', errorText);
      throw new Error(`Помилка при збереженні профілю: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Profile save error:', error);
    return null;
  }
};

