/**
 * ECHO LiveOS 2.0 API Routes dla DealSense
 * Endpointy do integracji z potężnym AI
 * Czas tworzenia: 2 minuty 🚀
 */

const express = require('express');
const echoBridge = require('../echo-bridge');
const router = express.Router();

/**
 * POST /api/echo/chat
 * Główny endpoint chatu z ECHO AI
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, userId, sessionId, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const response = await echoBridge.processShoppingQuery(message, {
      userId,
      sessionId,
      ...context
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Przepraszam, wystąpił błąd. Spróbuj ponownie.'
    });
  }
});

/**
 * POST /api/echo/predict
 * Predykcja potrzeb użytkownika
 */
router.post('/predict', async (req, res) => {
  try {
    const { userId, userProfile } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const prediction = await echoBridge.predictUserNeeds(userId, userProfile);

    res.json(prediction);

  } catch (error) {
    console.error('❌ Predict endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Prediction failed'
    });
  }
});

/**
 * POST /api/echo/score
 * Kwantowe scoring ofert
 */
router.post('/score', async (req, res) => {
  try {
    const { offers, userPreferences } = req.body;

    if (!offers || !Array.isArray(offers)) {
      return res.status(400).json({
        success: false,
        error: 'Offers array is required'
      });
    }

    const scoredOffers = await echoBridge.quantumScoreOffers(offers, userPreferences);

    res.json(scoredOffers);

  } catch (error) {
    console.error('❌ Score endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Scoring failed'
    });
  }
});

/**
 * POST /api/echo/recommend
 * Kreatywne rekomendacje
 */
router.post('/recommend', async (req, res) => {
  try {
    const { userContext, currentProduct } = req.body;

    if (!userContext || !currentProduct) {
      return res.status(400).json({
        success: false,
        error: 'User context and current product are required'
      });
    }

    const recommendations = await echoBridge.generateCreativeRecommendations(userContext, currentProduct);

    res.json(recommendations);

  } catch (error) {
    console.error('❌ Recommend endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Recommendation failed'
    });
  }
});

/**
 * POST /api/echo/contribute
 * Wkład do kolektywnej inteligencji
 */
router.post('/contribute', async (req, res) => {
  try {
    const { userId, insight } = req.body;

    if (!userId || !insight) {
      return res.status(400).json({
        success: false,
        error: 'User ID and insight are required'
      });
    }

    const contribution = await echoBridge.contributeShoppingInsight(userId, insight);

    res.json(contribution);

  } catch (error) {
    console.error('❌ Contribute endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Contribution failed'
    });
  }
});

/**
 * GET /api/echo/status
 * Status systemu ECHO
 */
router.get('/status', (req, res) => {
  const status = echoBridge.getSystemStatus();
  res.json(status);
});

/**
 * POST /api/echo/initialize
 * Inicjalizacja ECHO Bridge
 */
router.post('/initialize', async (req, res) => {
  try {
    const success = await echoBridge.initialize();
    
    if (success) {
      res.json({
        success: true,
        message: 'ECHO Bridge initialized successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to initialize ECHO Bridge'
      });
    }

  } catch (error) {
    console.error('❌ Initialize endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Initialization failed'
    });
  }
});

module.exports = router;
