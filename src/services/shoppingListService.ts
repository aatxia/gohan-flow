const API_URL = 'http://localhost:5000/api/shopping-list';

export const getShoppingList = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    if (!response.ok) {
      throw new Error('Помилка при завантаженні списку покупок');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const saveShoppingList = async (listData: any) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listData),
    });
    
    if (!response.ok) {
      throw new Error('Помилка при збереженні списку покупок');
    }
    
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

