/**
 * ECHO CLOUD - API Server
 * 
 * REST API for ECHO Cloud
 */

require('dotenv').config();
const express = require('express');
const EchoCloud = require('./echo-cloud');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize ECHO
let echo = null;

async function initializeEcho() {
  echo = new EchoCloud();
  await echo.initialize();
  console.log('✅ ECHO Cloud initialized');
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /answer
 * 
 * Body:
 * {
 *   "question": "Your question here",
 *   "context": { "domain": "business", "complexity": 3 }
 * }
 */
app.post('/answer', async (req, res) => {
  try {
    const { question, context = {} } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    const result = await echo.answer(question, context);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /status
 */
app.get('/status', (req, res) => {
  try {
    const status = echo.getStatus();
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /specialists
 */
app.get('/specialists', (req, res) => {
  const specialists = Object.entries(require('./echo-cloud').SPECIALISTS || {}).map(([key, spec]) => ({
    key,
    name: spec.name,
    role: spec.role,
    gearShift: spec.gearShift || 'BASE',
    costWeight: spec.costWeight
  }));
  
  res.json({
    success: true,
    data: specialists
  });
});

// ============================================================================
// START SERVER
// ============================================================================

async function start() {
  try {
    await initializeEcho();
    
    app.listen(PORT, () => {
      console.log(`🚀 ECHO Cloud API running on port ${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/health`);
      console.log(`📍 Status: http://localhost:${PORT}/status`);
      console.log(`📍 Answer: POST http://localhost:${PORT}/answer`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  if (echo) {
    await echo.shutdown();
  }
  process.exit(0);
});

start();
