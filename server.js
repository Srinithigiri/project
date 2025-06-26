const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

console.log('Starting server...');
console.log('Express:', express ? 'Loaded' : 'Not found');
console.log('Cors:', cors ? 'Loaded' : 'Not found');
console.log('Mongoose:', mongoose ? 'Loaded' : 'Not found');

const app = express();
const PORT = process.env.PORT || 5000; // Default to 5000 or environment variable
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/destinationsDB';

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define destination schema and model
const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  budget: { type: Number, required: true },
  travelTime: { type: Number, required: true },
  route: { type: String, required: true },
}, { timestamps: true });

const Destination = mongoose.model('Destination', destinationSchema);

// Get all destinations
app.get('/api/destinations', async (req, res) => {
  try {
    console.log('GET /api/destinations requested');
    const destinations = await Destination.find();
    res.json(destinations);
  } catch (error) {
    console.error('Error in GET /api/destinations:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// Add a new destination
app.post('/api/destinations', async (req, res) => {
  try {
    console.log('POST /api/destinations requested with body:', req.body);
    const { name, budget, travelTime, route } = req.body;
    if (!name || !budget || !travelTime || !route) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newDestination = new Destination({
      name,
      budget: parseInt(budget),
      travelTime: parseInt(travelTime),
      route,
    });

    const savedDestination = await newDestination.save();
    console.log('New destination added:', savedDestination);
    res.status(201).json(savedDestination);
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
