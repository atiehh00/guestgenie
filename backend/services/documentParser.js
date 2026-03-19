const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function parseDocument(file) {
  const ext = file.originalname.toLowerCase().split('.').pop();

  if (ext === 'pdf') {
    const result = await pdfParse(file.buffer);
    return result.text;
  }

  if (ext === 'docx') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (ext === 'txt') {
    return file.buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file type: .${ext}`);
}

module.exports = { parseDocument };
