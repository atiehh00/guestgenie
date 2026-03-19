const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function askClaude(property, guestMessage) {
  const systemPrompt = `You are a helpful assistant for guests staying at the following property.

Property Information:
- Name: ${property.property_name}
- Address: ${property.address}
- Host: ${property.host_name}
- Check-in: ${property.checkin_time}
- Check-out: ${property.checkout_time}
- WiFi Name: ${property.wifi_name}
- WiFi Password: ${property.wifi_password}
- Key Box Code: ${property.keybox_code}
- Key Box Location: ${property.keybox_location}
- House Rules: ${property.house_rules}
- Parking: ${property.parking_info}
- Emergency Contact: ${property.emergency_contact}

Rules you MUST follow:
1. Only answer using the information provided above. Do NOT invent or assume any details.
2. If you don't know the answer, tell the guest to contact the host directly.
3. Detect the language the guest is writing in and reply in that same language.
4. Be friendly and professional in tone.
5. In case of emergency (fire, accident, medical): immediately recommend calling emergency services (112 in Europe) and contacting the host.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: guestMessage }],
  });

  return message.content[0].text;
}

module.exports = { askClaude };
