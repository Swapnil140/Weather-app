const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo_key';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEOCODING_BASE_URL = 'https://api.openweathermap.org/geo/1.0';

// Mock cities data for demo purposes
const mockCities = [
  { name: 'London', country: 'GB' },
  { name: 'New York', country: 'US', state: 'NY' },
  { name: 'Tokyo', country: 'JP' },
  { name: 'Paris', country: 'FR' },
  { name: 'Sydney', country: 'AU' },
  { name: 'Berlin', country: 'DE' },
  { name: 'Mumbai', country: 'IN' },
  { name: 'Toronto', country: 'CA', state: 'ON' },
  { name: 'Dubai', country: 'AE' },
  { name: 'Singapore', country: 'SG' },
  { name: 'Los Angeles', country: 'US', state: 'CA' },
  { name: 'Barcelona', country: 'ES' },
  { name: 'Amsterdam', country: 'NL' },
  { name: 'Rome', country: 'IT' },
  { name: 'Bangkok', country: 'TH' },
];

// Weather endpoint
app.post('/api/weather', async (req, res) => {
  try {
    const { city } = req.body;

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return res.status(400).json({ error: 'City name is required' });
    }

    // Check if we have a valid API key
    if (OPENWEATHER_API_KEY === 'demo_key') {
      // Return mock data for demo purposes
      const mockData = {
        city: city.trim(),
        country: 'Demo',
        temperature: 22,
        description: 'clear sky',
        humidity: 65,
        windSpeed: 12,
        visibility: 10000,
        pressure: 1013,
        feelsLike: 24,
        icon: '01d',
      };

      return res.json(mockData);
    }

    // Make request to OpenWeatherMap API
    const weatherUrl = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(
      city.trim()
    )}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;

    // Format the response
    const formattedData = {
      city: weatherData.name,
      country: weatherData.sys.country,
      temperature: weatherData.main.temp,
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed * 3.6, // Convert m/s to km/h
      visibility: weatherData.visibility,
      pressure: weatherData.main.pressure,
      feelsLike: weatherData.main.feels_like,
      icon: weatherData.weather[0].icon,
    };

    res.json(formattedData);
  } catch (error) {
    console.error('Weather API error:', error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'City not found' });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    res.status(500).json({ error: 'Weather service unavailable' });
  }
});

// Cities suggestions endpoint
app.post('/api/cities', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.json([]);
    }

    const searchQuery = query.trim().toLowerCase();

    // Check if we have a valid API key
    if (OPENWEATHER_API_KEY === 'demo_key') {
      // Return filtered mock data for demo purposes
      const filteredCities = mockCities
        .filter(city => 
          city.name.toLowerCase().includes(searchQuery)
        )
        .slice(0, 8); // Limit to 8 suggestions

      return res.json(filteredCities);
    }

    // Make request to OpenWeatherMap Geocoding API
    const geocodingUrl = `${GEOCODING_BASE_URL}/direct?q=${encodeURIComponent(
      searchQuery
    )}&limit=8&appid=${OPENWEATHER_API_KEY}`;

    const geocodingResponse = await axios.get(geocodingUrl);
    const geocodingData = geocodingResponse.data;

    // Format the response
    const formattedCities = geocodingData.map(city => ({
      name: city.name,
      country: city.country,
      state: city.state,
    }));

    res.json(formattedCities);
  } catch (error) {
    console.error('Cities API error:', error.message);

    // Fallback to mock data if API fails
    const searchQuery = req.body.query?.trim().toLowerCase() || '';
    const filteredCities = mockCities
      .filter(city => 
        city.name.toLowerCase().includes(searchQuery)
      )
      .slice(0, 8);

    res.json(filteredCities);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Weather API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌤️  Weather API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 API Key status: ${OPENWEATHER_API_KEY === 'demo_key' ? 'Demo Mode' : 'Live Mode'}`);
});