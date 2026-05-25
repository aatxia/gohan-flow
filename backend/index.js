const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;


app.use(cors());
app.use(bodyParser.json());


try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error("❌ Помилка підключення ключа. Перевір, чи файл serviceAccountKey.json існує в цій папці.");
  process.exit(1);
}

const db = admin.firestore();


app.get('/', (req, res) => {
  res.send('🚀 GohanFlow Server running on port ' + PORT);
});


app.post('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const userData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    
    if (doc.exists) {
      await userRef.update(userData);
    } else {
      userData.createdAt = new Date().toISOString();
      await userRef.set(userData);
    }
    
    res.json({ message: 'User profile updated', uid });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/api/users/:uid', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.uid).get();
    if (!doc.exists) return res.status(404).send('User not found');
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/api/recipes', async (req, res) => {
  try {
    const snapshot = await db.collection('recipes')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();
    const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(recipes);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.post('/api/recipes', async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      prepTime,
      cookTime,
      ingredients,
      instructions,
      authorId,
      authorName,
    } = req.body;


    if (!name || name.trim().length < 3) {
      return res.status(400).json({ error: 'Recipe name must be at least 3 characters' });
    }
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ error: 'Description must be at least 10 characters' });
    }
    if (!type || !['breakfast', 'lunch', 'dinner', 'snack'].includes(type)) {
      return res.status(400).json({ error: 'Invalid meal type' });
    }
    if (!prepTime || prepTime < 0 || !cookTime || cookTime < 0) {
      return res.status(400).json({ error: 'Prep and cook times must be non-negative numbers' });
    }
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'At least one ingredient is required' });
    }
    if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
      return res.status(400).json({ error: 'At least one instruction step is required' });
    }
    if (!authorId || !authorName) {
      return res.status(400).json({ error: 'Author information is required' });
    }


    const recipe = {
      name: name.trim(),
      description: description.trim(),
      type,
      prepTime: parseInt(prepTime),
      cookTime: parseInt(cookTime),
      ingredients: ingredients.map((ing) => ({
        name: (ing.name || '').trim(),
        quantity: (ing.quantity || '').trim(),
        price: ing.price || 0,
      })),
      instructions: instructions.map((inst) => inst.trim()).filter((inst) => inst.length > 0),
      authorId,
      authorName,
      calories: req.body.calories || 0,
      protein: req.body.protein || 0,
      carbs: req.body.carbs || 0,
      fat: req.body.fat || 0,
      fiber: req.body.fiber || 0,
      price: req.body.price || 0,
      servings: req.body.servings || 1,
      tags: req.body.tags || [],
      likes: 0,
      comments: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const resDb = await db.collection('recipes').add(recipe);
    res.json({ id: resDb.id, ...recipe, message: "Recipe added and pending moderation" });
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ error: error.message || 'Failed to add recipe' });
  }
});


app.put('/api/recipes/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['published', 'pending', 'draft', 'rejected'].includes(status)) {
      return res.status(400).send('Invalid status');
    }
    
    const recipeRef = db.collection('recipes').doc(req.params.id);
    const recipeDoc = await recipeRef.get();
    
    if (!recipeDoc.exists) {
      return res.status(404).send('Recipe not found');
    }
    
    await recipeRef.update({
      status,
      updatedAt: new Date().toISOString(),
    });
    

    const recipeData = recipeDoc.data();
    if (recipeData.authorId) {
      const statusMessages = {
        published: 'Your recipe has been approved and published!',
        rejected: 'Your recipe was not approved. Please review and resubmit.',
      };
      
      if (statusMessages[status]) {
        await db.collection('notifications').add({
          userId: recipeData.authorId,
          type: 'recipe',
          title: `Recipe ${status === 'published' ? 'Approved' : 'Rejected'}`,
          message: statusMessages[status],
          recipeId: req.params.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
    
    res.json({ message: `Recipe status updated to ${status}` });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.post('/api/recipes/:id/comments', async (req, res) => {
  try {
    const recipeRef = db.collection('recipes').doc(req.params.id);
    const recipeDoc = await recipeRef.get();
    
    if (!recipeDoc.exists) {
      return res.status(404).send('Recipe not found');
    }
    
    const comment = {
      id: `c${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    
    const comments = recipeDoc.data().comments || [];
    await recipeRef.update({
      comments: [...comments, comment],
      updatedAt: new Date().toISOString(),
    });
    
    res.json(comment);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.post('/api/recipes/:id/like', async (req, res) => {
  try {
    const recipeRef = db.collection('recipes').doc(req.params.id);
    const recipeDoc = await recipeRef.get();
    
    if (!recipeDoc.exists) {
      return res.status(404).send('Recipe not found');
    }
    
    const recipeData = recipeDoc.data();
    const currentLikes = recipeData.likes || 0;
    const authorId = recipeData.authorId;
    
    await recipeRef.update({
      likes: currentLikes + 1,
      updatedAt: new Date().toISOString(),
    });
    

    if (authorId && req.body.userId && authorId !== req.body.userId) {
      await db.collection('notifications').add({
        userId: authorId,
        type: 'recipe',
        title: 'New Like on Your Recipe',
        message: `Someone liked your recipe "${recipeData.name}"`,
        recipeId: req.params.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    
    res.json({ likes: currentLikes + 1 });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/api/plans/:uid', async (req, res) => {
  try {
    const snapshot = await db.collection('plans')
      .where('userId', '==', req.params.uid)
      .orderBy('createdAt', 'desc')
      .get();
    const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(plans);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/api/plans/:uid/current', async (req, res) => {
  try {
    const snapshot = await db.collection('plans')
      .where('userId', '==', req.params.uid)
      .where('isCurrent', '==', true)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.json(null);
    }
    
    const plan = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    res.json(plan);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.post('/api/plans', async (req, res) => {
  try {
    const plan = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    

    if (plan.isCurrent) {
      const snapshot = await db.collection('plans')
        .where('userId', '==', plan.userId)
        .where('isCurrent', '==', true)
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isCurrent: false });
      });
      await batch.commit();
    }
    
    const resDb = await db.collection('plans').add(plan);
    

    if (plan.userId) {
      await db.collection('notifications').add({
        userId: plan.userId,
        type: 'meal',
        title: 'New Meal Plan Generated',
        message: `Your personalized meal plan is ready! Total cost: $${plan.totalWeeklyCost?.toFixed(2) || '0.00'}`,
        planId: resDb.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    
    res.json({ id: resDb.id, message: "Plan saved" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.put('/api/plans/:id', async (req, res) => {
  try {
    const data = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    

    if (data.isCurrent) {
      const planDoc = await db.collection('plans').doc(req.params.id).get();
      const userId = planDoc.data().userId;
      
      const snapshot = await db.collection('plans')
        .where('userId', '==', userId)
        .where('isCurrent', '==', true)
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        if (doc.id !== req.params.id) {
          batch.update(doc.ref, { isCurrent: false });
        }
      });
      await batch.commit();
    }
    
    await db.collection('plans').doc(req.params.id).update(data);
    res.json({ message: "Plan updated" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.delete('/api/plans/:id', async (req, res) => {
  try {
    await db.collection('plans').doc(req.params.id).delete();
    res.json({ message: "Plan deleted" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/api/shopping-list/:uid', async (req, res) => {
  try {
    const doc = await db.collection('shoppingLists').doc(req.params.uid).get();
    if (!doc.exists) {
      return res.json(null);
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.post('/api/shopping-list', async (req, res) => {
  try {
    const list = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    
    const userId = list.userId;
    const listRef = db.collection('shoppingLists').doc(userId);
    const doc = await listRef.get();
    
    const isNew = !doc.exists;
    
    if (doc.exists) {
      await listRef.update(list);
    } else {
      list.createdAt = new Date().toISOString();
      await listRef.set(list);
    }
    

    if (userId) {
      await db.collection('notifications').add({
        userId: userId,
        type: 'shopping',
        title: isNew ? 'Shopping List Created' : 'Shopping List Updated',
        message: `Your shopping list has been ${isNew ? 'created' : 'updated'} with ${list.items?.length || 0} items.`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    
    res.json({ id: userId, message: "List saved" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', req.params.userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(notifications);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.post('/api/notifications', async (req, res) => {
  try {
    const notification = {
      ...req.body,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const resDb = await db.collection('notifications').add(notification);
    res.json({ id: resDb.id, ...notification });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.put('/api/notifications/:userId/:notificationId/read', async (req, res) => {
  try {
    await db.collection('notifications').doc(req.params.notificationId).update({
      read: true,
      readAt: new Date().toISOString(),
    });
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.put('/api/notifications/:userId/read-all', async (req, res) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', req.params.userId)
      .where('read', '==', false)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: new Date().toISOString(),
      });
    });
    await batch.commit();
    
    res.json({ message: "All notifications marked as read", count: snapshot.docs.length });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/api/who-advice/:userId', async (req, res) => {
  try {

    const userDoc = await db.collection('users').doc(req.params.userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    

    const snapshot = await db.collection('whoAdvice')
      .where('status', '==', 'active')
      .orderBy('priority', 'desc')
      .get();
    
    let advice = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    

    if (userData.dietaryPreference) {
      advice = advice.filter(a => 
        !a.dietaryRestrictions || 
        a.dietaryRestrictions.includes(userData.dietaryPreference) ||
        a.dietaryRestrictions.length === 0
      );
    }
    
    res.json(advice);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.post('/api/who-advice', async (req, res) => {
  try {
    const advice = {
      ...req.body,
      status: req.body.status || 'active',
      priority: req.body.priority || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const resDb = await db.collection('whoAdvice').add(advice);
    res.json({ id: resDb.id, message: "WHO advice added" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/api/users/:uid/shared-recipes', async (req, res) => {
  try {
    const snapshot = await db.collection('recipes')
      .where('authorId', '==', req.params.uid)
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();
    const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(recipes);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.post('/api/users/:uid/share-recipe', async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userRef = db.collection('users').doc(req.params.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }
    
    const userData = userDoc.data();
    const sharedRecipes = userData.sharedRecipes || [];
    
    if (!sharedRecipes.includes(recipeId)) {
      await userRef.update({
        sharedRecipes: [...sharedRecipes, recipeId],
        updatedAt: new Date().toISOString(),
      });
    }
    
    res.json({ message: "Recipe shared in profile" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
});
