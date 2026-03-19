const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

// POST /api/property — create new property
router.post('/', async (req, res) => {
  const {
    host_name,
    property_name,
    address,
    checkin_time,
    checkout_time,
    wifi_name,
    wifi_password,
    keybox_code,
    keybox_location,
    house_rules,
    parking_info,
    emergency_contact,
  } = req.body;

  const { data, error } = await supabase
    .from('properties')
    .insert([{
      host_name,
      property_name,
      address,
      checkin_time,
      checkout_time,
      wifi_name,
      wifi_password,
      keybox_code,
      keybox_location,
      house_rules,
      parking_info,
      emergency_contact,
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// GET /api/property/:id — get property by id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Property not found' });
  res.json(data);
});

module.exports = router;
