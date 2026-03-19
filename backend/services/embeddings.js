const OpenAI = require('openai');
const supabase = require('./supabase');

let openai = null;

function getClient() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) return null;
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

async function createEmbedding(text) {
  const client = getClient();
  if (!client) throw new Error('OPENAI_API_KEY not configured');
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

function splitIntoChunks(text, chunkSize = 500) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ').trim();
    if (chunk) chunks.push(chunk);
  }
  return chunks;
}

async function searchSimilarChunks(propertyId, query, limit = 5) {
  // Skip RAG if OpenAI is not configured
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const queryEmbedding = await createEmbedding(query);

    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: limit,
      p_property_id: propertyId,
    });

    if (error) {
      console.error('RAG search error:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map(d => d.chunk_text).join('\n\n');
  } catch (err) {
    console.error('RAG search failed:', err.message);
    return null;
  }
}

module.exports = { createEmbedding, splitIntoChunks, searchSimilarChunks };
