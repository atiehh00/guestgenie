-- Run this in Supabase SQL Editor

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create property_documents table
CREATE TABLE property_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  filename text,
  chunk_text text,
  embedding vector(1536),
  created_at timestamp DEFAULT now()
);

-- 3. Create index for fast similarity search
CREATE INDEX ON property_documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. Create the similarity search function (used by backend)
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  p_property_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  property_id uuid,
  filename text,
  chunk_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pd.id,
    pd.property_id,
    pd.filename,
    pd.chunk_text,
    1 - (pd.embedding <=> query_embedding) AS similarity
  FROM property_documents pd
  WHERE pd.property_id = p_property_id
  ORDER BY pd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
