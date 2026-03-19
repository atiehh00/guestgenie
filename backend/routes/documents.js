const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../services/supabase');
const { parseDocument } = require('../services/documentParser');
const { createEmbedding, splitIntoChunks } = require('../services/embeddings');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// POST /api/documents/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { property_id } = req.body;
    if (!property_id || !req.file) {
      return res.status(400).json({ error: 'property_id and file are required' });
    }

    // Parse document to text
    const text = await parseDocument(req.file);
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Could not extract text from document' });
    }

    // Split into chunks
    const chunks = splitIntoChunks(text);

    // Create embeddings and save to Supabase
    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk);
      const { error } = await supabase.from('property_documents').insert({
        property_id,
        filename: req.file.originalname,
        chunk_text: chunk,
        embedding: JSON.stringify(embedding),
      });
      if (error) {
        console.error('Insert chunk error:', error.message);
      }
    }

    res.json({ success: true, chunks: chunks.length });
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/:property_id
router.get('/:property_id', async (req, res) => {
  const { data, error } = await supabase
    .from('property_documents')
    .select('id, filename, created_at')
    .eq('property_id', req.params.property_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Group by filename with chunk count
  const grouped = {};
  for (const row of data) {
    if (!grouped[row.filename]) {
      grouped[row.filename] = { filename: row.filename, chunks: 0, created_at: row.created_at };
    }
    grouped[row.filename].chunks++;
  }

  res.json(Object.values(grouped));
});

// DELETE /api/documents/:property_id/:filename
router.delete('/:property_id/:filename', async (req, res) => {
  const { error } = await supabase
    .from('property_documents')
    .delete()
    .eq('property_id', req.params.property_id)
    .eq('filename', decodeURIComponent(req.params.filename));

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
