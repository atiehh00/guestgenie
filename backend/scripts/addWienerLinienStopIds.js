require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const updates = [
  { property_name: 'Altbau-Juwel am Stephansplatz',        wiener_linien_stop_id: '4118' },
  { property_name: 'Prater-Loft mit Riesenrad-Blick',      wiener_linien_stop_id: '4103' },
  { property_name: 'Elegantes Währinger Cottage',           wiener_linien_stop_id: '4909' },
  { property_name: 'Studentisches Loft am Alsergrund',      wiener_linien_stop_id: '4909' },
  { property_name: 'Gemütliche Wohnung nahe Naschmarkt',    wiener_linien_stop_id: '4082' },
  { property_name: 'Kreativ-WG in Ottakring',               wiener_linien_stop_id: '4215' },
  { property_name: 'Penzing Hideaway mit Wienerwaldblick',  wiener_linien_stop_id: '4215' },
  { property_name: 'Villa-Apartment Hietzing',              wiener_linien_stop_id: '4501' },
];

async function run() {
  console.log(`Updating ${updates.length} properties with Wiener Linien stop IDs...\n`);

  for (const { property_name, wiener_linien_stop_id } of updates) {
    const { data, error } = await supabase
      .from('properties')
      .update({ wiener_linien_stop_id })
      .eq('property_name', property_name)
      .select('id, property_name')
      .single();

    if (error) {
      console.error(`✗ ${property_name}: ${error.message}`);
    } else {
      console.log(`✓ ${data.property_name} → RBL ${wiener_linien_stop_id}`);
    }
  }

  console.log('\nDone.');
}

run();
