const express = require('express');
const cors = require('cors');

console.log('Starting server...');
console.log('Express:', express ? 'Loaded' : 'Not found');
console.log('Cors:', cors ? 'Loaded' : 'Not found');

const app = express();
const PORT = process.env.PORT || 5000; // Default to 5000 or environment variable

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS

// In-memory storage for destinations
let destinations = [
  { id: 1, name: 'Tokyo', budget: 1500, travelTime: 15, route: 'New Delhi to Tokyo via Singapore' },
  { id: 2, name: 'Paris', budget: 1200, travelTime: 12, route: 'New Delhi to Paris via Dubai' },
];

console.log('Initial destinations:', destinations);

// Get all destinations
app.get('/api/destinations', (req, res) => {
  try {
    console.log('GET /api/destinations requested');
    res.json(destinations);
  } catch (error) {
    console.error('Error in GET /api/destinations:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// Add a new destination
app.post('/api/destinations', (req, res) => {
  try {
    console.log('POST /api/destinations requested with body:', req.body);
    const { name, budget, travelTime, route } = req.body;
    if (!name || !budget || !travelTime || !route) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const newDestination = {
      id: Date.now(),
      name,
      budget: parseInt(budget),
      travelTime: parseInt(travelTime),
      route,
    };
    destinations.push(newDestination);
    console.log('New destination added:', newDestination);
    res.status(201).json(newDestination);
  } catch (error) {
    console.error('Error in POST /api/destinations:', error);
    res.status(500).json({ error: 'Failed to add destination' });
  }
});

// Function to find a free port
const findFreePort = (port) => {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      server.close(() => resolve(port));
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying ${port + 1}...`);
        resolve(findFreePort(port + 1));
      } else {
        console.error('Server error:', err);
        resolve(null);
      }
    });
  });
};

// Start the server with port fallback
(async () => {
  try {
    console.log('Attempting to start server on port:', PORT);
    const port = await findFreePort(PORT);
    if (port) {
      app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });
    } else {
      console.error('Failed to find a free port after multiple attempts');
    }
  } catch (error) {
    console.error('Failed to start server:', error.message);
  }
})();