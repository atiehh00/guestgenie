require('dotenv').config();
const express = require('express');
const cors = require('cors');

const propertyRoutes = require('./routes/property');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/property', propertyRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'GuestGenie backend running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
