const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { askClaude } = require('../services/claude');
const { getWeather } = require('../services/weather');

// POST /api/chat
router.post('/', async (req, res) => {
  const { property_id, message, history } = req.body;

  if (!property_id || !message) {
    return res.status(400).json({ error: 'property_id and message are required' });
  }

  // Fetch property data from Supabase
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', property_id)
    .single();

  if (error) return res.status(404).json({ error: 'Property not found' });

  // Fetch current weather for the property city
  const rawCity = property.address ? property.address.split(',').pop().trim() : null;
  const city = rawCity ? rawCity.replace(/^\d+\s*/, '').trim() : null;
  const weatherInfo = city ? await getWeather(city) : null;

  // Get response from Claude
  const response = await askClaude(property, message, history, weatherInfo);

  // Save conversation to Supabase
  await supabase.from('conversations').insert([{
    property_id,
    guest_message: message,
    bot_response: response,
  }]);

  res.json({ response });
});

module.exports = router;
