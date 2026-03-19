const OpenAI = require('openai');
const supabase = require('./supabase');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function createEmbedding(text) {
  const response = await openai.embeddings.create({
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
}

module.exports = { createEmbedding, splitIntoChunks, searchSimilarChunks };
