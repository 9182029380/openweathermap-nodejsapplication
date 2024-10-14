const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

// Create Express app
const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/weatherDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected!'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

// Define a Mongoose schema for weather
const weatherSchema = new mongoose.Schema({
  id: Number,
  main: String,
  description: String,
  icon: String
});

// Create a Mongoose model
const Weather = mongoose.model('Weather', weatherSchema);

// API route to get weather data and save it to MongoDB
app.get('/save-weather', async (req, res) => {
  try {
    const apiKey = '3301519246e749b9b45247cd0fb0291c';  // Your OpenWeatherMap API key
    const city = req.query.city;  // Get the city from query parameter
    
    // Check if city is provided in the query
    if (!city) {
      return res.status(400).json({ error: 'Please provide a city name' });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    
    // Fetch weather data
    const response = await axios.get(weatherUrl);
    
    // Extract the 'weather' data from the response
    const weatherData = response.data.weather[0]; // Extract only the first weather object

    // Create a new weather document from the fetched data
    const newWeather = new Weather({
      id: weatherData.id,
      main: weatherData.main,
      description: weatherData.description,
      icon: weatherData.icon
    });

    // Save the weather data to MongoDB
    await newWeather.save();

    res.json({
      message: 'Weather data saved successfully!',
      weatherData: newWeather
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch or save weather data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
