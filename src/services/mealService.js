const API_URL = 'http://localhost:5000/api/meals';

export const getAllMeals = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Помилка при завантаженні даних');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const addMeal = async (mealData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mealData),
    });
    
    if (!response.ok) {
      throw new Error('Помилка при збереженні');
    }
    
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteMeal = async (id) => {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};