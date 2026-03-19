const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function askClaude(property, guestMessage, history = [], weatherInfo = null) {
  const systemPrompt = `You are a helpful assistant for guests staying at the following property.

Property Information:
- Name: ${property.property_name}
- Adresse: ${property.address}
- Host: ${property.host_name}
- Check-in Zeit: ${property.checkin_time}
- Check-out Zeit: ${property.checkout_time}
- Stockwerk & Wohnungsnummer: ${property.floor_and_unit}
- Check-in Anleitung: ${property.checkin_instructions}
- WLAN-Name: ${property.wifi_name}
- WLAN-Passwort: ${property.wifi_password}
- Schlüsselbox-Code: ${property.keybox_code}
- Schlüsselbox-Standort: ${property.keybox_location}
- Handtücher & Bettwäsche: ${property.towels_bedding_info}
- Waschmaschine: ${property.washing_machine_info}
- Heizung / Klimaanlage: ${property.heating_ac_info}
- Mülltrennung & Entsorgung: ${property.trash_disposal_info}
- Haushaltsgeräte: ${property.household_appliances_info}
- Nächste U-Bahn / Öffis: ${property.nearest_public_transport}
- Nächster Supermarkt: ${property.nearest_supermarket}
- Restaurant-Empfehlungen: ${property.restaurant_recommendations}
- Max. Gästeanzahl: ${property.max_guests}
- Haustiere erlaubt: ${property.pets_allowed}
- Rauchen erlaubt: ${property.smoking_allowed}
- Besondere Hinweise: ${property.special_notes}
- Hausregeln: ${property.house_rules}
- Parkplatz: ${property.parking_info}
- Notfallkontakt: ${property.emergency_contact}

${weatherInfo ? `Current weather: ${weatherInfo}\n\n` : ''}Rules you MUST follow:
1. Only answer using the information provided above. Do NOT invent or assume any details.
2. If you don't know the answer, tell the guest to contact the host directly.
3. Detect the language the guest is writing in and reply in that same language.
4. Be friendly and professional in tone.
5. In case of emergency (fire, accident, medical): immediately recommend calling emergency services (112 in Europe) and contacting the host.`;

  const historyMessages = history
    .slice(1) // skip the welcome message (first bot message)
    .map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [...historyMessages, { role: 'user', content: guestMessage }],
  });

  return message.content[0].text;
}

module.exports = { askClaude };
