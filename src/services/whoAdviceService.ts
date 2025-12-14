const API_URL = 'http://localhost:5000/api/who-advice';

export const getWhoAdvice = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    if (!response.ok) {
      throw new Error('Помилка при завантаженні порад ВООЗ');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

