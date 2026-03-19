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
    floor_and_unit,
    checkin_instructions,
    wifi_name,
    wifi_password,
    keybox_code,
    keybox_location,
    towels_bedding_info,
    washing_machine_info,
    heating_ac_info,
    trash_disposal_info,
    household_appliances_info,
    nearest_public_transport,
    nearest_supermarket,
    restaurant_recommendations,
    max_guests,
    pets_allowed,
    smoking_allowed,
    special_notes,
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
      floor_and_unit,
      checkin_instructions,
      wifi_name,
      wifi_password,
      keybox_code,
      keybox_location,
      towels_bedding_info,
      washing_machine_info,
      heating_ac_info,
      trash_disposal_info,
      household_appliances_info,
      nearest_public_transport,
      nearest_supermarket,
      restaurant_recommendations,
      max_guests,
      pets_allowed,
      smoking_allowed,
      special_notes,
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
