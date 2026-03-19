const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function askClaude(property, guestMessage, history = [], weatherInfo = null, wienerLinienInfo = null, ragContext = null) {
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

${weatherInfo ? `Current weather: ${weatherInfo}\n\n` : ''}${wienerLinienInfo ? `Aktuelle Abfahrten (Echtzeit Wiener Linien): ${wienerLinienInfo}\n\n` : ''}${ragContext ? `Additional knowledge from host documents:\n${ragContext}\nUse this information to answer guest questions when relevant.\n\n` : ''}Rules you MUST follow (in priority order):

PRIORITY 1 — Property data:
Answer ONLY from the property information provided above. Never invent or assume any details.

PRIORITY 2 — Web search:
ONLY use web search for general factual questions where a wrong answer is very unlikely.
Examples: "What is the taxi number in Vienna?", "Is the Naschmarkt open on Sunday?"
NEVER use web search for anything property-specific (check-in, wifi, rules, etc.)

PRIORITY 3 — Escalate to host:
If you are not 100% sure about an answer — DO NOT guess. Tell the guest:
"I'm not sure about that. Please contact your host directly: ${property.emergency_contact}"

A wrong answer is always worse than no answer. When in doubt, escalate to the host.

Additional rules:
- Detect the language the guest is writing in and reply in that same language.
- Be friendly and professional in tone.
- In case of emergency (fire, accident, medical): immediately recommend calling emergency services (112 in Europe) and contacting the host.`;

  const historyMessages = history
    .slice(1) // skip the welcome message (first bot message)
    .map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

  const message = await client.beta.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [...historyMessages, { role: 'user', content: guestMessage }],
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    betas: ['web-search-2025-03-05'],
  });

  // Extract final text from response — web search returns an array of content blocks
  const textBlock = message.content.findLast(block => block.type === 'text');
  return textBlock ? textBlock.text : 'I could not generate a response. Please contact your host.';
}

module.exports = { askClaude };
